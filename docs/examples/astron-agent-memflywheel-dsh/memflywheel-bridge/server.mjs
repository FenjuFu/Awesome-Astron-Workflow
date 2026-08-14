import http from "node:http";
import { mkdir, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createMemFlywheelHarnessRuntime } from "@iflytekopensource/memflywheel";

const here = path.dirname(fileURLToPath(import.meta.url));
const host = process.env.MEMFLYWHEEL_BRIDGE_HOST || "0.0.0.0";
const port = Number(process.env.MEMFLYWHEEL_BRIDGE_PORT || 8787);
const root = path.resolve(process.env.MEMFLYWHEEL_HOME || path.join(here, "data"));
const allowedTypes = new Set(["identity", "preference", "style", "workflow", "context", "ambient"]);
const maxBodyBytes = 64 * 1024;

await mkdir(root, { recursive: true });
const runtime = createMemFlywheelHarnessRuntime({
  mode: "recall-only",
  root,
  refuseSecrets: true,
});

function sendJson(response, status, value) {
  const body = JSON.stringify(value, null, 2);
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(body),
  });
  response.end(body);
}

function requiredText(value, field, maxLength = 8_000) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} must be a non-empty string`);
  }
  if (value.length > maxLength) throw new Error(`${field} is too long`);
  return value.trim();
}

async function readJson(request) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > maxBodyBytes) throw new Error("request body is too large");
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function compactRecall(context) {
  const prelude = context.preludePrompt || "";
  return {
    enabled: context.enabled,
    memoryIndexed:
      prelude.includes("Available Memory Entries") ||
      prelude.includes("Relevant Memory Entries") ||
      prelude.includes("MEMORY.md"),
    preludePreview: prelude.slice(0, 1_200),
  };
}

async function saveMemory(payload) {
  const type = requiredText(payload.type || "workflow", "type", 32);
  if (!allowedTypes.has(type)) throw new Error(`unsupported memory type: ${type}`);
  const name = requiredText(payload.name, "name", 160);
  const description = typeof payload.description === "string" ? payload.description.slice(0, 500) : "";
  const body = requiredText(payload.body, "body");
  const result = await runtime.sdk.save({ type, name, description, body });
  return { result, type, name };
}

async function recallMemory(payload) {
  const sessionId = requiredText(payload.sessionId || "astron-demo", "sessionId", 160);
  const query = requiredText(payload.query, "query", 1_000);
  const context = await runtime.sdk.onPromptBuild({ sessionId, query });
  return { sessionId, query, ...compactRecall(context) };
}

async function collectEvidence() {
  const indexFile = path.join(root, "MEMORY.md");
  const indexInfo = await stat(indexFile);
  const workflowDir = path.join(root, "workflow");
  const names = (await readdir(workflowDir)).filter((name) => name.endsWith(".md"));
  const records = await Promise.all(
    names.map(async (name) => {
      const fullPath = path.join(workflowDir, name);
      const info = await stat(fullPath);
      return { name, fullPath, bytes: info.size, modifiedAt: info.mtime.toISOString() };
    }),
  );
  records.sort((left, right) => right.modifiedAt.localeCompare(left.modifiedAt));
  const latest = records[0] || null;
  const latestPreview = latest
    ? (await readFile(latest.fullPath, "utf8")).slice(0, 1_500)
    : "";
  const indexPreview = (await readFile(indexFile, "utf8")).slice(0, 1_500);
  return {
    ok: true,
    evidenceType: "real-filesystem-readback",
    memoryFileCount: records.length,
    latestMemory: latest,
    indexFile,
    indexBytes: indexInfo.size,
    latestPreview,
    indexPreview,
  };
}

async function route(request, response) {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, {
      ok: true,
      service: "astron-memflywheel-demo-bridge",
      package: "@iflytekopensource/memflywheel",
      packageVersion: "0.1.1",
      mode: "recall-only",
      memoryRoot: root,
    });
    return;
  }
  if (request.method === "GET" && url.pathname === "/v1/evidence") {
    sendJson(response, 200, await collectEvidence());
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 404, { ok: false, error: "not found" });
    return;
  }

  const payload = await readJson(request);
  if (url.pathname === "/v1/memory/save") {
    sendJson(response, 200, { ok: true, save: await saveMemory(payload) });
    return;
  }
  if (url.pathname === "/v1/memory/recall") {
    sendJson(response, 200, { ok: true, recall: await recallMemory(payload) });
    return;
  }
  if (url.pathname === "/v1/demo") {
    const runId = requiredText(payload.runId || new Date().toISOString().replace(/\D/g, "").slice(0, 14), "runId", 80);
    const locale = payload.locale === "en" ? "en" : "zh";
    const query = requiredText(
      payload.query ||
        (locale === "en"
          ? "How should Astron Agent present the MemFlywheel demo result?"
          : "Astron Agent 调用 MemFlywheel 后应该如何输出演示结果？"),
      "query",
      1_000,
    );
    const save = await saveMemory({
      type: "workflow",
      name: `astron-memflywheel-${runId}`,
      description:
        locale === "en"
          ? "A demo memory created by a real Astron Agent workflow call to MemFlywheel"
          : "Astron Agent 工作流真实调用 MemFlywheel 的演示记忆",
      body:
        locale === "en"
          ? `Run ID: ${runId}\nUser request: ${query}\nOutput contract: return the save status, recall status, and next action.`
          : `运行编号：${runId}\n用户请求：${query}\n输出规范：返回写入状态、召回状态和下一步建议。`,
    });
    const recall = await recallMemory({ sessionId: `astron-${runId}`, query });
    sendJson(response, 200, {
      ok: true,
      integration: "Astron Agent workflow -> local adapter -> MemFlywheel SDK",
      sdkMode: "recall-only",
      locale,
      runId,
      save,
      recall,
      evidence: {
        indexFile: path.join(root, "MEMORY.md"),
        memoryFile: path.join(root, "workflow", `${save.name}.md`),
      },
    });
    return;
  }
  sendJson(response, 404, { ok: false, error: "not found" });
}

const server = http.createServer((request, response) => {
  route(request, response).catch((error) => {
    sendJson(response, 400, { ok: false, error: error?.message || String(error) });
  });
});

server.listen(port, host, () => {
  console.log(JSON.stringify({ event: "ready", host, port, root, mode: "recall-only" }));
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
