import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HOST = '127.0.0.1'
const PORT = 8789
const ROOT = path.dirname(fileURLToPath(import.meta.url))
const PRIVATE_EXPORT = path.join(ROOT, '.runtime', 'astron-private', 'exported-original.SKILL.md')
const MAX_REQUEST_BYTES = 1024 * 1024

function loadPrivateConfig() {
  const markdown = fs.readFileSync(PRIVATE_EXPORT, 'utf8')
  const endpoint = markdown.match(/curl\s+-N\s+-X\s+POST\s+'([^']+)'/)?.[1]
  const flowId = markdown.match(/"flow_id"\s*:\s*"([^"]+)"/)?.[1]
  const headers = {}
  for (const match of markdown.matchAll(/-H\s+'([^']+)'/g)) {
    const separator = match[1].indexOf(':')
    if (separator <= 0) continue
    headers[match[1].slice(0, separator).trim()] = match[1].slice(separator + 1).trim()
  }
  if (!endpoint || !flowId || !headers.Authorization) throw new Error('PRIVATE_EXPORT_INVALID')
  const target = new URL(endpoint)
  const localHttp = target.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(target.hostname)
  if (target.protocol !== 'https:' && !localHttp) throw new Error('PRIVATE_EXPORT_ENDPOINT_INSECURE')
  return { endpoint, flowId, headers }
}

function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
  })
  res.end(body)
}

async function readJson(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_REQUEST_BYTES) throw new Error('REQUEST_TOO_LARGE')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function parseSse(text) {
  const events = []
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith('data:')) continue
    const data = line.slice(5).trimStart()
    if (!data || data === '[DONE]') continue
    try {
      events.push(JSON.parse(data))
    }
    catch {
      // Ignore non-JSON event payloads; the summary still reports the parsed count.
    }
  }
  return events
}

function collectTexts(value, output = [], key = '') {
  if (typeof value === 'string') {
    if (/^(?:text|content|answer|output|message)$/i.test(key) && value.trim()) output.push(value.trim())
    return output
  }
  if (Array.isArray(value)) {
    for (const item of value) collectTexts(item, output, key)
    return output
  }
  if (!value || typeof value !== 'object') return output
  for (const [childKey, child] of Object.entries(value)) collectTexts(child, output, childKey)
  return output
}

const privateConfig = loadPrivateConfig()
const server = http.createServer(async (req, res) => {
  const startedAt = Date.now()
  try {
    if (req.method === 'GET' && req.url === '/health') {
      sendJson(res, 200, { ok: true, configured: true })
      return
    }
    if (req.method !== 'POST' || req.url !== '/run') {
      sendJson(res, 404, { ok: false, error: 'NOT_FOUND' })
      return
    }

    const request = await readJson(req)
    const input = typeof request.input === 'string' ? request.input.trim() : ''
    const uid = typeof request.uid === 'string' && request.uid.trim() ? request.uid.trim() : 'dsh-demo-user'
    if (!input) {
      sendJson(res, 400, { ok: false, error: 'INPUT_REQUIRED' })
      return
    }

    const upstream = await fetch(privateConfig.endpoint, {
      method: 'POST',
      headers: privateConfig.headers,
      body: JSON.stringify({
        flow_id: privateConfig.flowId,
        uid,
        parameters: { AGENT_USER_INPUT: input },
        history: [],
        stream: true,
      }),
    })
    const responseText = await upstream.text()
    const events = parseSse(responseText)
    const texts = [...new Set(events.flatMap(event => collectTexts(event)))]
      .filter(text => text !== 'Success')
      .slice(-16)
    const finalEvent = events.at(-1)
    const providerCode = finalEvent && typeof finalEvent.code === 'number' ? finalEvent.code : undefined
    const ok = upstream.ok && (providerCode === undefined || providerCode === 0)
    sendJson(res, ok ? 200 : 502, {
      ok,
      httpStatus: upstream.status,
      providerCode: providerCode ?? null,
      eventCount: events.length,
      texts,
    })
    process.stdout.write(`POST /run -> ${upstream.status} events=${events.length} ${Date.now() - startedAt}ms\n`)
  }
  catch (error) {
    const code = error instanceof Error ? error.message : 'BRIDGE_FAILURE'
    sendJson(res, code === 'REQUEST_TOO_LARGE' ? 413 : 502, { ok: false, error: code })
  }
})

server.listen(PORT, HOST, () => {
  process.stdout.write(`Astron SKILL bridge listening on http://${HOST}:${PORT}\n`)
})
