import http from 'node:http'

const HOST = '127.0.0.1'
const PORT = 8788
const UPSTREAM_ORIGIN = 'https://spark-api-open.xf-yun.com'
const MAX_REQUEST_BYTES = 16 * 1024 * 1024

function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
  })
  res.end(body)
}

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_REQUEST_BYTES) throw new Error('REQUEST_TOO_LARGE')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

function parseDataFrame(frame) {
  const lines = frame.split(/\r?\n/)
  const data = lines
    .filter(line => line.startsWith('data:'))
    .map(line => line.slice(5).trimStart())
    .join('\n')
  if (!data || data === '[DONE]') return undefined
  try {
    return JSON.parse(data)
  }
  catch {
    return undefined
  }
}

function rewriteDataFrame(frame, payload) {
  const lines = frame.split(/\r?\n/)
  let replaced = false
  return lines.map(line => {
    if (!replaced && line.startsWith('data:')) {
      replaced = true
      return `data:${JSON.stringify(payload)}`
    }
    if (replaced && line.startsWith('data:')) return undefined
    return line
  }).filter(line => line !== undefined).join('\n')
}

function patchSparkSse(text) {
  const newline = text.includes('\r\n') ? '\r\n' : '\n'
  const frames = text.split(/\r?\n\r?\n/)
  let sawToolCall = false
  let lastChoiceFrame = -1
  let lastChoicePayload

  for (let index = 0; index < frames.length; index += 1) {
    const payload = parseDataFrame(frames[index])
    if (!payload || !Array.isArray(payload.choices) || payload.choices.length === 0) continue
    lastChoiceFrame = index
    lastChoicePayload = payload
    for (const choice of payload.choices) {
      const delta = choice?.delta ?? choice?.message ?? {}
      if (delta.tool_calls || delta.function_call) sawToolCall = true
    }
  }

  if (lastChoiceFrame >= 0 && lastChoicePayload) {
    let changed = false
    lastChoicePayload.choices = lastChoicePayload.choices.map(choice => {
      if (choice.finish_reason !== undefined && choice.finish_reason !== null) return choice
      changed = true
      return { ...choice, finish_reason: sawToolCall ? 'tool_calls' : 'stop' }
    })
    if (changed) frames[lastChoiceFrame] = rewriteDataFrame(frames[lastChoiceFrame], lastChoicePayload)
  }

  return frames.join(`${newline}${newline}`)
}

const server = http.createServer(async (req, res) => {
  const startedAt = Date.now()
  try {
    if (req.method === 'GET' && req.url === '/health') {
      sendJson(res, 200, { ok: true, upstream: 'spark-api-open.xf-yun.com' })
      return
    }

    if (!req.url?.startsWith('/v1/')) {
      sendJson(res, 404, { error: { message: 'Not found', type: 'proxy_error' } })
      return
    }

    const body = await readBody(req)
    const headers = new Headers()
    for (const name of ['authorization', 'content-type', 'accept', 'user-agent']) {
      const value = req.headers[name]
      if (typeof value === 'string') headers.set(name, value)
    }

    const upstream = await fetch(new URL(req.url, UPSTREAM_ORIGIN), {
      method: req.method,
      headers,
      body: body.length === 0 ? undefined : body,
    })

    const responseBody = await upstream.text()
    const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream'
    const output = contentType.includes('text/event-stream')
      ? patchSparkSse(responseBody)
      : responseBody

    const responseHeaders = { 'content-type': contentType }
    for (const name of ['x-request-id', 'request-id']) {
      const value = upstream.headers.get(name)
      if (value) responseHeaders[name] = value
    }
    res.writeHead(upstream.status, responseHeaders)
    res.end(output)
    process.stdout.write(`${req.method} ${new URL(req.url, 'http://localhost').pathname} -> ${upstream.status} ${Date.now() - startedAt}ms\n`)
  }
  catch (error) {
    const code = error instanceof Error ? error.message : 'PROXY_FAILURE'
    sendJson(res, code === 'REQUEST_TOO_LARGE' ? 413 : 502, {
      error: { message: code, type: 'proxy_error' },
    })
  }
})

server.listen(PORT, HOST, () => {
  process.stdout.write(`Spark OpenAI compatibility proxy listening on http://${HOST}:${PORT}\n`)
})
