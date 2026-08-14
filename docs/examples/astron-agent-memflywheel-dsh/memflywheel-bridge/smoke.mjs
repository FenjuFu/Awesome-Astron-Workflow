const baseUrl = process.env.MEMFLYWHEEL_BRIDGE_URL || "http://127.0.0.1:8787";
const runId = `smoke-${Date.now()}`;

const health = await fetch(`${baseUrl}/health`).then((response) => response.json());
if (!health.ok || health.packageVersion !== "0.1.1") throw new Error("bridge health check failed");

const demo = await fetch(`${baseUrl}/v1/demo`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    runId,
    query: "请记住：Astron Agent 的 MemFlywheel 演示必须返回真实写入和召回证据。",
  }),
}).then((response) => response.json());

if (!demo.ok) throw new Error(`demo request failed: ${JSON.stringify(demo)}`);
if (demo.save?.result !== "completed") throw new Error(`unexpected save result: ${demo.save?.result}`);
if (!demo.recall?.enabled || !demo.recall?.memoryIndexed) {
  throw new Error(`recall evidence missing: ${JSON.stringify(demo.recall)}`);
}

console.log(JSON.stringify({ health, demo }, null, 2));
