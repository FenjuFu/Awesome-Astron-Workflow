# Astron Agent & RPA 常见问题精选 (Refined FAQ)

> 本文档基于社区问答整理，涵盖部署、认证、模型配置、RPA及常见报错等高频问题。

## 1. 部署与安装 (Deployment)

### Q: 启动时提示端口被占用 (Port occupied) 怎么办？
**A:**
1.  **检查端口**: 默认使用 8000 (Console), 8020 (MCP), 3000 (Casdoor) 等端口。使用 `netstat -ano | findstr <port>` (Windows) 或 `lsof -i :<port>` (Linux) 查看占用进程。
2.  **修改配置**: 在 `.env` 文件中修改冲突服务的端口映射 (如 `CONSOLE_PORT`)。
3.  **Docker冲突**: 确保没有旧的容器在运行 (`docker ps -a`)。尝试 `docker compose down` 清理后再启动。

### Q: 部署后访问 404 或 502 Bad Gateway？
**A:**
1.  **检查日志**: 执行 `docker compose logs -f astron-agent-console-hub` 或 `nginx` 查看具体报错。
2.  **等待启动**: 服务启动需要时间，特别是第一次拉取镜像和初始化数据库时。
3.  **配置检查**: 确认 `.env` 文件中的 `HOST_BASE_ADDRESS` 或 `CONSOLE_API_URL` 是否配置正确（应为浏览器可访问的 IP/域名，而非 `localhost` 如果是远程部署）。

### Q: 镜像拉取失败 (Download failed) 或速度慢？
**A:**
1.  **配置镜像源**: 在 `/etc/docker/daemon.json` 中配置国内加速镜像 (如阿里云、网易等)。
2.  **网络代理**: 确保服务器可以访问 Docker Hub 或 GitHub。

### Q: 如何更新到最新版本？
**A:**
1.  执行 `git pull` 拉取最新代码。
2.  执行 `docker compose pull` 更新镜像。
3.  **注意**: 如果涉及数据库变更，可能需要执行 `docker compose down -v` (会清除数据！) 或手动处理 Flyway 迁移。常规更新建议先 `down` 再 `up -d`。

---

## 2. 认证与登录 (Casdoor & Auth)

### Q: 登录后一直在登录页循环，或跳转到 localhost？
**A:**
1.  **Casdoor配置**: 这是一个经典问题。Casdoor 的 `origin` 和 `redirect_uri` 必须与浏览器访问的地址一致。
2.  **环境变量**: 检查 `.env` 中的 `CASDOOR_EXTERNAL_ENDPOINT`。如果你在云服务器部署，必须填公网 IP/域名，不能填 `127.0.0.1`。
3.  **Casdoor后台**: 登录 Casdoor 管理后台 (默认端口 8000 或 3000)，检查 Application 的回调地址配置。

### Q: 报错 "auth name: Authorization, auth value: None"？
**A:**
1.  **Token丢失**: 请求头中未携带有效的 Authorization Token。
2.  **配置错误**: 检查 Casdoor 的 Client ID/Secret 是否与 `.env` 中配置的一致。

---

## 3. 模型与API配置 (Models & LLM)

### Q: 模型下拉框为空，无法添加模型？
**A:**
1.  **平台配置**: 在 Astron Console 的“模型管理”中添加模型。
2.  **环境变量**: 确保 `.env` 中配置了基础的 LLM 服务地址 (`AICHAT_BASE_URL`)。
3.  **网络连通性**: 确保容器能访问外部模型 API (如星火、DeepSeek、OpenAI)。

### Q: 如何配置 DeepSeek 或其他 OpenAI 兼容模型？
**A:**
1.  在 `.env` 或平台模型配置中，选择 OpenAI 格式。
2.  Base URL 填 `https://api.deepseek.com` (举例)。
3.  API Key 填对应的 Key。
4.  **注意**: 如果是本地 Ollama，Base URL 需填 `http://host.docker.internal:11434` (Docker 访问宿主机)。

### Q: 图片理解/OCR 插件报错？
**A:**
1.  需要在 `.env` 中配置讯飞开放平台的 `XFYUN_APP_ID`, `XFYUN_API_KEY`, `XFYUN_API_SECRET`。
2.  确保该 APPID 已在讯飞开放平台开通了对应的图像识别/OCR 能力权限。

---

## 4. RPA 相关

### Q: RPA 客户端无法登录 / "Websocket bad handshake"？
**A:**
1.  **服务端地址**: 客户端设置的服务端地址必须正确 (http://IP:Port)。
2.  **网络**: 确保 WebSocket 端口 (通常与 API 端口相关) 未被防火墙拦截。
3.  **配置**: 检查 RPA 配置文件 `conf.yaml` 中的 `remote_addr`。

### Q: 元素抓取 (Pick Element) 失败或不准确？
**A:**
1.  **模式选择**: 区分 "桌面元素" 和 "网页元素"。网页建议使用浏览器插件模式。
2.  **自定义 XPath**: 如果自动抓取不准，可在高级设置中手动输入 XPath。
3.  **环境**: 确保缩放比例为 100%，多屏可能导致坐标偏移。

### Q: Excel/WPS 自动化报错 "未检测到注册表信息"？
**A:**
1.  **权限**: 尝试以管理员身份运行 RPA 客户端，或反之（有时管理员权限会导致找不到用户级安装的 Office 注册表）。
2.  **安装**: 确保 WPS/Office 安装完整，并未损坏。

---

## 5. 常见报错排查 (Troubleshooting)

### Q: 数据库报错 "PostgreSQL node request error (25030)"？
**A:**
1.  **SQL语法**: 检查生成的 SQL 语句是否合法。
2.  **字段匹配**: 确保插入的数据字段与表结构一致。
3.  **大模型生成**: 如果是 LLM 生成的 SQL，建议在提示词中加强约束，或使用非 SQL 模式的数据库节点。

### Q: 数据库迁移失败 "Validate failed: Migrations have failed validation"？
**A:**
1.  这是 Flyway 版本控制冲突。
2.  **解决**: 如果是测试环境，执行 `docker compose down -v` 清空数据库卷重新初始化。如果是生产环境，需要手动修复 `flyway_schema_history` 表。

---

## 6. 其他

### Q: 是否支持私有化部署？
**A:**
开源版支持私有化部署。企业版提供更多高级功能 (如多租户管理、更强的权限控制等)。

### Q: 文档和教程在哪里？
**A:**
- GitHub Wiki / README
- 星辰 Agent 官网文档
- 社区提供的视频教程 (AI大学等)
