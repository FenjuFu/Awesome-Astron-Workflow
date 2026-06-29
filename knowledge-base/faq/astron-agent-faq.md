# Astron Agent 常见问题解答 (FAQ)

> 本文档汇总了 Astron Agent 在部署、配置、使用过程中的常见问题。内容整理自官方文档及社区问答。

## 目录

1.  [部署与安装 (Deployment & Installation)](#1-部署与安装-deployment--installation)
2.  [配置与认证 (Configuration & Authentication)](#2-配置与认证-configuration--authentication)
3.  [模型与 AI 功能 (Models & AI Features)](#3-模型与-ai-功能-models--ai-features)
4.  [常见报错排查 (Troubleshooting)](#4-常见报错排查-troubleshooting)
5.  [功能与使用 (Features & Usage)](#5-功能与使用-features--usage)
6.  [社区与资源 (Community & Resources)](#6-社区与资源-community--resources)

---

## 1. 部署与安装 (Deployment & Installation)

### Q: 镜像拉取失败 (Download failed) 或速度慢？
**A:** 这通常是由于国内网络连接 Docker Hub 不稳定导致的。
1.  **配置镜像源**: 在 `/etc/docker/daemon.json` 中配置国内加速镜像（如阿里云、网易、南京大学等）。
    - 示例：`ghcr.nju.edu.cn` 可作为 `ghcr.io` 的替代。
2.  **修改配置**: 编辑 `docker-compose.yaml`，将镜像地址中的 `ghcr.io/` 替换为国内镜像源地址（如 `ghcr.nju.edu.cn/`）。
3.  **网络代理**: 确保服务器可以访问外部网络，或配置 Docker 代理。

### Q: 启动时提示端口被占用 (Port occupied)？
**A:**
1.  **检查端口**: 默认使用 8000 (Console), 8020 (MCP), 3000 (Casdoor) 等端口。
    - Windows: `netstat -ano | findstr <port>`
    - Linux: `lsof -i :<port>`
2.  **修改配置**: 在 `.env` 文件中修改冲突服务的端口映射 (如 `CONSOLE_PORT`)。
3.  **Docker冲突**: 确保没有旧的容器在运行。尝试 `docker compose down` 清理后再启动。

### Q: 部署后访问 404 或 502 Bad Gateway？
**A:**
1.  **检查日志**: 执行 `docker compose logs -f` 查看 `astron-agent-console-hub` 或 `nginx` 的报错。
2.  **等待启动**: 服务启动需要时间，特别是第一次拉取镜像和初始化数据库时，请耐心等待。
3.  **配置检查**: 确认 `.env` 中的 `HOST_BASE_ADDRESS` 或 `CONSOLE_API_URL` 配置正确（远程部署时应为公网 IP/域名，而非 `localhost`）。

### Q: 必须安装 Docker 吗？
**A:** 是的，Astron Agent 平台依赖 Docker 进行容器化部署。
- **服务端**: 推荐 Linux (x86_64)。Mac (ARM) 用户请使用 `docker-compose-macos.yml`。Windows 用户可通过 WSL2 或 Docker Desktop 部署。

### Q: 如何更新到最新版本？
**A:**
1.  **拉取代码**: `git pull origin main`
2.  **更新镜像**: `docker compose pull`
3.  **重启服务**:
    ```bash
    docker compose down
    docker compose up -d
    ```
    *注意*: 如果涉及数据库字段变更，可能需要执行数据库迁移。如果测试环境允许，可使用 `docker compose down -v` 清空数据重新初始化（**慎用，会删除所有数据**）。

### Q: 启动时遇到 `request returned 500 Internal Server Error` 报错？
**A:** 这通常是 Docker API 版本不匹配或环境状态不一致导致的。请尝试以下步骤：
1.  备份重要数据。
2.  执行 `docker compose -f docker-compose-with-auth.yaml down -v` 清理容器和数据卷（注意：此步骤会删除数据）。
3.  运行 `git restore docker` 恢复 docker 目录下的文件修改。
4.  检查环境变量 `ASTRON_AGENT_VERSION` 是否设置为稳定版（如 `v1.0.0-rc.x`）。
5.  重新执行 `docker compose -f docker-compose-with-auth.yaml up -d` 启动服务。
6.  清理浏览器缓存或使用无痕模式访问。

### Q: 如何正确修改默认端口 (80)？
**A:**
1.  **修改配置**: 在 `.env` 文件中修改 `CONSOLE_PORT` 等相关端口配置。
2.  **重置 Casdoor**: Casdoor 对端口变化敏感。修改端口后，通常需要执行 `docker compose down -v` 清空数据并重启，以触发 Casdoor 重新初始化配置（**警告：此操作会删除所有用户和应用数据，请提前备份**）。
3.  **避免循环重定向**: 如果修改端口后遇到登录页无限循环或跳转错误，通常是因为 Casdoor 数据库中仍存储旧的端口配置，必须重置数据库。

### Q: 为什么使用 `latest` 镜像却不是最新的？
**A:** Docker 的 `latest` 标签仅在第一次拉取时生效。
1.  **手动更新**: 必须执行 `docker compose pull` 才能拉取最新的 `latest` 镜像。
2.  **推荐做法**: 建议在 `.env` 中将 `ASTRON_AGENT_VERSION` 设置为具体的版本号 (如 `v1.0.0`) 而非 `latest`，以确保环境稳定和版本可控。

---

## 2. 配置与认证 (Configuration & Authentication)

### Q: 登录后一直在登录页循环，或跳转到 localhost？
**A:**
1.  **Casdoor 配置**: Casdoor 的 `origin` 和 `redirect_uri` 必须与浏览器访问的地址一致。
2.  **环境变量**: 检查 `.env` 中的 `CASDOOR_EXTERNAL_ENDPOINT`。云服务器部署时必须填公网 IP/域名。
3.  **Casdoor 后台**: 登录 Casdoor 管理后台 (默认端口 8000 或 3000)，检查 Application 的回调地址配置。

### Q: 默认的账号密码是什么？
**A:**
- **Casdoor (管理后台)**: 账号 `admin`，密码 `123`。
- **Ragflow**: 需要自行注册账号。

### Q: 验证码接口报错或无法登录？
**A:**
1.  检查 Casdoor 服务是否正常启动。
2.  检查 `.env` 中验证码相关配置。
3.  如果是 Casdoor 配置导致的无限跳转，尝试修改 `astron-agent/docker/astronAgent/casdoor/conf/app.conf`，将 `initDataNewOnly = true` 改为 `false` 并重启。

### Q: Casdoor 支持 HTTPS 吗？
**A:** 目前 Astron 内置的 Casdoor 配置可能不支持直接开启 HTTPS。建议在 Casdoor 服务前添加一层 **Nginx 反向代理** 来处理 SSL/HTTPS 加密。

### Q: 创建应用失败，日志显示 403 错误？
**A:** 403 通常是权限或认证问题。请检查环境变量配置（如 API Key、Secret 等）是否正确填写，且与部署文档要求一致。

### Q: 修改了 IP 地址或端口配置后不生效？
**A:** 修改 `.env` 文件或 `docker-compose.yaml` 中的环境变量后，必须重启容器才能生效：
`docker compose down` 然后 `docker compose up -d`。

### Q: 客户端可以切换组织吗？
**A:** 可以。客户端登录基于 Casdoor 认证。请参考 [带认证的部署指南](https://github.com/iflytek/astron-agent/blob/main/docs/DEPLOYMENT_GUIDE_WITH_AUTH_zh.md)，在 Casdoor 管理页面进行组织和用户的配置。

---

## 3. 模型与 AI 功能 (Models & AI Features)

### Q: 模型下拉框为空，无法添加模型？
**A:**
1.  **平台配置**: 在 Astron Console 的“模型管理”中添加模型。
2.  **环境变量**: 确保 `.env` 中配置了基础的 LLM 服务地址 (`AICHAT_BASE_URL`)。
3.  **网络连通性**: 确保容器能访问外部模型 API (如星火、DeepSeek、OpenAI)。

### Q: 如何配置 DeepSeek 或其他 OpenAI 兼容模型？
**A:**
1.  在“模型管理”中选择 **OpenAI** 格式。
2.  **Base URL**: 填对应的 API 地址 (如 `https://api.deepseek.com`)。
    - *本地模型*: 如果是宿主机上的 Ollama/Xinference，使用 `http://host.docker.internal:11434` 或局域网 IP。
3.  **API Key**: 填对应的 Key。

### Q: 添加本地模型报错 IP 在黑名单？
**A:** 默认配置可能禁止连接私有网段。
- **解决方法**: 进入数据库，删除或清空 `config_info` 表中 `category = 'NETWORK_SEGMENT_BLACK_LIST'` 的记录。
- **SQL 示例**: `SELECT * FROM config_info WHERE category = 'NETWORK_SEGMENT_BLACK_LIST';` (确认后删除或清空 value)

### Q: 如何配置本地服务（如本地部署的大模型）给 Agent 调用？
**A:**
1.  **网络互通**：确保 Docker 容器内的服务能访问到宿主机或局域网内的服务。
    - 不要使用 `localhost` 或 `127.0.0.1`，因为这会指向容器自身。
    - 使用宿主机的局域网 IP（如 `192.168.x.x`）或 Docker 的特殊 DNS `host.docker.internal`（视 Docker 版本和系统而定）。
2.  **黑名单限制**：默认配置可能禁止连接私有网段（如 `192.168.x.x`）。如果遇到拦截，需要修改数据库表 `config_info` (或 `config_info_en`) 中的黑名单配置。

### Q: 如何配置本地 Xinference 部署的大模型？
**A:** 配置 `AICHAT_BASE_URL` 和 `AICHAT_API_KEY` 环境变量。确保 Base URL 能被容器访问（参考上一条网络配置）。如果配置后单轮对话返回空，请检查 API 格式是否兼容 OpenAI 标准。

### Q: 图片理解/OCR 插件报错？
**A:**
1.  在 `.env` 中配置讯飞开放平台的 `XFYUN_APP_ID`, `XFYUN_API_KEY`, `XFYUN_API_SECRET`。
2.  确保该 APPID 已在讯飞开放平台开通了对应的图像识别/OCR 能力权限。

### Q: 如何获取和使用星火知识库资源？
**A:**
1.  **开通服务**: 在[讯飞开放平台](https://console.xfyun.cn/services/aidoc)开通知识库能力。
2.  **获取 ID**: 创建知识库获取 `XINGHUO_DATASET_ID`。
3.  **配置环境**: 将 ID 更新到环境变量 `XINGHUO_DATASET_ID` 中。
4.  **工具使用**: 可使用 `astron-agent/docs/xinghuo_rag_tool.html` 或通过 cURL 命令行工具创建和管理数据集。

### Q: 在“模型管理”添加第三方模型时，接口地址 (URL) 或 API Key 超过 100 字符限制无法保存怎么办？
**A:** 在旧版本前端界面存在 100 字符的硬性限制。
- **解决方案**: 如果进行私有化部署，可修改前端源码 `console/frontend/src/pages/model-management/components/modal-component.tsx`，将对应输入框的 `maxLength={100}` 改为更大的值（如 500），然后重新构建前端（`npm run build`）并部署。后续官方版本将放宽此限制。

### Q: 使用 deepseek-reasoner 等带有长思考过程的模型时，出现超时或显示异常怎么办？
**A:** 思考过程过长可能导致请求超时。临时解决方案是切换为不带长思考过程的模型（如 deepseek-chat）。另外也可关注并尝试调整 `CODE_EXEC_TIMEOUT_SEC` 配置，但核心侧的超时机制较难直接修改。

### Q: 开源版是否支持使用第三方（如硅基流动）兼容接口进行图像/视频生成？
**A:** 目前开源版图像/视频生成功能主要依赖讯飞付费资源包，暂不支持直接配置使用硅基流动等其他兼容接口。

---

## 4. 常见报错排查 (Troubleshooting)

### Q: 数据库报错 "PostgreSQL node request error", "SQLSyntaxErrorException" 或 SQL 语法错误？
**A:**
1.  **检查 SQL**: 确认生成的 SQL 语句是否合法，字段是否匹配。
2.  **版本同步**: 如果代码更新了但数据库报错，可能是数据库 Schema 未同步。尝试运行 `docker compose up -d atlas` 或手动执行 SQL 补全字段。
3.  **常见错误**: `SQLSyntaxErrorException` 通常是代码更新了但数据库未自动迁移。查看日志中的 SQL 错误，手动在数据库执行缺少的字段添加操作。

### Q: 数据库迁移失败 "Validate failed: Migrations have failed validation" 或报 `FlywayValidateException`？
**A:** 这是 Flyway 版本控制冲突，通常会导致服务陷入无限重启。
- **测试环境 (终极修复)**: 执行 `docker compose -f docker-compose-with-auth.yaml down -v` 清空数据库卷和容器（**警告：会删除所有数据**），然后运行 `git restore docker` 清理本地改动，重新 `docker compose up -d` 启动并清理浏览器缓存。
- **生产环境**: 手动修复 `flyway_schema_history` 表。

### Q: 接口报错 "auth name: Authorization, auth value: None"？
**A:**
1.  **Token 丢失**: 请求头未携带有效的 Authorization Token。
2.  **配置错误**: 检查 Casdoor Client ID/Secret 是否与 `.env` 一致。

### Q: 调用第三方工具报错 SSL 错误？
**A:** 这通常是容器内的 SSL 证书问题或网络环境导致的。检查容器是否能正常访问公网 HTTPS 地址。

### Q: 服务启动失败 (如 `astron-core-link` returned non-zero exit status 1) 如何排查？
**A:**
1. **检查端口**: 可能是端口冲突被占用，请检查相关端口的使用情况。
2. **查看日志**: 使用 `docker logs <container_name>` 查看详细报错日志以定位问题。

### Q: 跨域问题 (CORS) 如何解决？
**A:** 前端调用后端接口报跨域错误时，请检查 Nginx 代理配置或后端服务的 CORS 允许域名配置。

### Q: 启动后 `core-tenant` 或 `core-aitools` 服务一直重启，且报错连不上数据库？
**A:**
1.  检查 `.env` 文件中的 MySQL 配置是否正确。
2.  尝试手动重启 MySQL 容器：`docker restart astron-agent-mysql`（具体容器名请通过 `docker ps` 确认）。
3.  如果问题依旧，尝试执行 `docker compose down -v` 清理后重新启动。

### Q: 页面访问报错或加载不出来，如何排查？
**A:**
1.  **浏览器控制台**：按 `Ctrl + Shift + I` (Windows) 或 `Cmd + Option + I` (Mac) 打开开发者工具，查看 Network 面板是否有请求报错（红色 4xx/500 错误）。
2.  **查看容器日志**：
    *   查看所有日志：`docker compose logs -f`
    *   查看特定服务日志：`docker compose logs -f <服务名>` (例如 `astron-agent-console-hub`, `astron-agent-core-tenant`)。
    *   特别关注 `core-tenant` (租户服务) 和 `console-hub` (控制台后端) 的日志。

### Q: 调用 API 报错 `20001 Failed to get application`？
**A:**
1.  **检查 ID**: 确保 `flow_id` (工作流 ID) 正确。注意区分 `App ID` 和 `Flow ID`。
2.  **代码参数**: 检查示例代码中的 `xxx` 占位符是否已全部替换为实际值（如 `host`, `api_key` 等）。
3.  **协议匹配**: 本地部署通常使用 `HTTP` 协议，而官方示例可能默认为 `HTTPS`。请确保代码中使用的连接方式（如 `http.client.HTTPConnection`）与你的部署环境一致。

### Q: 代码节点运行报错 `ModuleNotFoundError: No module named 'json5'` 或缺少依赖？
**A:** 这是因为代码节点运行环境（容器）中缺少相关的 Python 依赖包。
1. **临时解决 (重启失效)**: 找到工作流容器名称（如 `astron-agent-core-workflow`），执行 `docker exec -it astron-agent-core-workflow pip install json5 -i https://pypi.tuna.tsinghua.edu.cn/simple`，安装完成后即可在页面重新运行。
2. **永久生效**: 创建自定义 `Dockerfile`（基于 `ghcr.io/iflytek/astron-agent-core-workflow:latest`），在其中加入 `RUN pip install json5` 等指令，修改 `docker-compose.yaml` 使用新镜像并重新构建 (`docker compose up -d --build`)。

### Q: 数据库更新或字段缺失导致报错怎么办？
**A:** 尝试拉取最新代码 (`git pull`)，然后运行 `docker compose up -d atlas` 来执行数据库迁移，更新字段。

### Q: 通过 API 调用工作流报错 `Failed to get application`？
**A:**
1.  **检查鉴权信息**：确保 Header 中正确传递了 `Authorization: Bearer {API_KEY}:{API_SECRET}`。
2.  **检查 ID 匹配**：
    *   确保使用的 `flow_id` 与发布的 API ID 一致。
    *   注意区分 `App ID` 和 `Flow ID`。
    *   确认请求 URL 中的 Host 和 Port 是否正确（指向 `console-hub` 或网关端口）。
3.  **参数替换**：如果是从示例代码复制，确保 `xxx` 等占位符已替换为实际值。

### Q: 私有化部署中 AITools 服务连接 MinIO/OSS 报错 403 Forbidden？
**A:** 这通常涉及域名转发配置问题。请检查 Nginx 等代理服务的域名和路径转发规则，确保正确配置了 MinIO/OSS 的访问路径与鉴权头传递。

---

## 5. 功能与使用 (Features & Usage)

### Q: 工作流创建失败或显示异常 (Unknown column)？
**A:**
1.  **原因**: 数据库表结构版本落后。
2.  **解决**: 检查后端日志，若出现 `Unknown column 'module_id'` 或 `type` 等错误，需在数据库执行相应的 `ALTER TABLE` 语句补全字段（如 `alter table c_param add column module_id varchar(50) DEFAULT NULL`）。

### Q: 知识库 (Knowledge Base) 常见问题？
**A:**
1.  **文件上传失败**:
    - 检查 MinIO 服务是否正常，端口（如 9000/9001）是否开放。
    - 检查 Agent 与 RAGFlow、MinIO 之间的网络连通性及环境变量配置。
2.  **RAGFlow 同步**: 目前支持从 Agent 上传同步至 RAGFlow；直接在 RAGFlow 上传的文件需在 Agent 端进行关联操作才能使用。
3.  **Rerank 模型**: 星火知识库默认启用 Rerank。

### Q: 数字人 (Digital Human) 加载失败或如何隐藏对话框？
**A:**
1.  **检查配置**: 确认 `APP_ID` 等鉴权信息是否正确配置。若依然报错（如权限校验失败），可能是旧版 bug，请尝试执行 `docker compose pull` 更新到最新镜像。
2.  **HTTPS 问题**: 如果非 HTTPS 部署，浏览器可能拦截麦克风/摄像头权限。尝试在 Chrome 中配置 `chrome://flags/#unsafely-treat-insecure-origin-as-secure` 将地址设为安全源。
3.  **UI定制 (隐藏对话框)**: 标准版默认带对话框，若需隐藏或全屏背景展示，建议基于 Astron 开源项目前端源码进行二次开发，或参考“星火快答”等解决方案。

### Q: 怎么使用虚拟人？
**A:**
1.  在[讯飞虚拟人官网](https://virtual-man.xfyun.cn/)申请服务。
2.  获取应用三元信息 (`APP_ID`, `API_KEY`, `API_SECRET`) 并填入 `.env`。
3.  **注意**: 浏览器媒体捕获 API 需要 HTTPS 或 localhost 环境。非安全环境需在 Chrome 中设置 `chrome://flags/#unsafely-treat-insecure-origin-as-secure`。

### Q: 变量如何使用？
**A:**
1.  **引用方式**: 在节点输入框中使用 `{{变量名}}` 引用上游节点输出或全局变量。
2.  **迭代节点**: 在迭代节点内部，使用当前迭代项变量（如 `item`）进行处理。
3.  **Python 代码节点**: 使用 `gv["变量名"]` 引用全局变量。

### Q: 标准 HTTP 插件只支持 JSON Object，后端接口需要顶层为 JSON Array 怎么办？
**A:** 
工作流中的标准 HTTP 插件节点默认请求体为 JSON Object（键值对）。如果外部接口强制要求顶层为 Array 格式（例如 `[{"skuId":...}]`），建议改用 **代码节点 (Code Node)**。通过编写简短的 Python/Node.js 脚本直接构建所需的 Array 格式并发送请求，从而绕过插件限制。

### Q: 创建 API Key 时提示 502 Bad Gateway？
**A:**
1.  **检查日志**: 查看 `openapi-service` 服务的日志。
2.  **版本更新**: 尝试更新 `openapi-service` 镜像到最新版本 (`docker compose pull`)。

### Q: 本地部署提示 API 鉴权失败？
**A:**
如果使用了需要讯飞开放平台能力的组件（如 OCR、大模型），请确保在 `.env` 文件中配置了正确的 `XFYUN_APP_ID`, `XFYUN_API_KEY`, `XFYUN_API_SECRET`。若暂不需要，可尝试跳过或不使用相关组件。

### Q: 如何自定义原子组件？
**A:** 目前需要修改代码并手动更新数据库中的原子树信息。后续版本将提供更便捷的自定义组件开发方式。

### Q: 支持自定义 MCP (Model Context Protocol) 工具吗？
**A:** 支持。可以在 Web 端的工作流节点（如 Agent 智能决策节点）中添加和配置 MCP 工具。

### Q: 从其他平台导出的 YAML 文件导入失败？
**A:** 目前不支持直接导入其他平台的 YAML 格式。可以使用 [AgentBridge](https://github.com/iflytek/agentbridge) 工具进行格式转换后再尝试导入。

### Q: 知识库（RAG）引用有问题，无法检索或回答？
**A:** 
1. 早期版本的对话型 Agent 在引用知识库时可能存在 Bug，建议更新到最新版本的镜像。
2. 目前系统使用的是 RAGFlow (v0.12.0 或指定版本) 作为底层引擎。
3. **工作流模式**下引用知识库通常更稳定。

### Q: 知识库 (RAG) 如何防止模型幻觉？
**A:** 
1. 检索到的知识库内容会作为上下文填充到 Prompt 中发送给模型。
2. 可以通过修改提示词（Prompt）来约束模型：例如添加“请仅依据检索到的内容回答，如果检索内容中没有答案，请直接回复不知道，不要编造”。

### Q: 已发布的应用如何删除或下架？
**A:**
*   目前版本（开源版）可能在界面上未直接提供“下架”按钮。
*   通常需要在“我的智能体”卡片中查找删除选项。
*   如果找不到下架/删除入口，可能是当前版本的已知问题（Issue），建议关注 GitHub 仓库的修复进度。

### Q: 智能体输出多模态内容（文字、图片、代码）时，前端如何解析显示？
**A:** 确认智能体输出多模态内容时，前端统一按 **Markdown** 格式标准进行解析与渲染。

### Q: 导入工作流后，在智能体列表中无法看到导入的智能体？
**A:** 这是已知 Bug (Issue #1119)，导入工作流时 `chat_bot_list` 表无数据导致。官方已跟进排查修复中，请关注后续版本更新。

### Q: 通过模版创建智能体时，数据库中 bot_template 字段无值？
**A:** 这是由于前端表单未传递模版信息导致的已知 Bug。用户可以通过手动向 `maas_template` 表插入数据临时规避，官方已跟进排查。

### Q: 在非个人空间下复制智能体时报错？
**A:** 这是已知 Bug (Issue #941)。请关注后续版本修复。

### Q: 发布到广场后，字符串类型的输入框显示为文件上传框？
**A:** 这是已确认的前端显示 Bug，将会在后续版本中修复。

---

> **注意**：Astron Agent 和 AstronRPA 处于快速迭代中，遇到问题建议先查看 [GitHub Issues](https://github.com/iflytek/astron-agent/issues) 是否已有解决方案，或更新到最新版本尝试。
