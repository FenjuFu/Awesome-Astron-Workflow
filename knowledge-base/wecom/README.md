# 企微知识库导入区 (WeCom Knowledge Base)

This folder is the drop zone for content exported from the team's **企业微信
（WeCom）知识库**. Any `.md` file placed here is picked up automatically by
`scripts/build-kb-index.js` (it walks `knowledge-base/` recursively) and indexed
into the `/chat` retrieval corpus — exactly like `faq/` and `cases/`.

`README.md` itself is excluded from the index, so these instructions never leak
into chat answers.

## 导入流程 (export → desensitize → rebuild)

1. **导出**：从企业微信知识库把目标文档导出为 Markdown（或复制正文整理成
   `.md`），按主题命名后放进本目录，例如 `部署支持-常见问题.md`。
2. **脱敏**：务必先按仓库的脱敏策略处理——`/chat` 是**公开端点**，任何访问者都能
   检索到这里的内容。删除/替换：
   - 客户、公司、人名 → 通用行业描述（如 *某大型能源企业*）或 `某用户`
   - 企微群 ID、`@chatroom` id、手机号、内部链接、图片文件名/时间戳 → 去除或
     替换为中性占位（如 `[图片]`）
   - 完整脱敏要求见上级目录的 [`../README.md`](../README.md)。
3. **重建索引**：
   ```
   npm run kb:build      # 重建 api/_lib/kb-index.json
   npm run kb:upload     # 上传到私有 Supabase bucket（生产用）
   # 或一步到位： npm run build-kb
   ```
   Vercel 部署时 `prebuild` 钩子会从私有 bucket 拉取最新索引，`/chat` 即生效。

> 如果以后要从企业微信 API（corpid + secret + wedoc 权限）自动同步，可在
> `scripts/` 下新增一个拉取脚本，把导出的文档写入本目录后复用上面的重建流程。
