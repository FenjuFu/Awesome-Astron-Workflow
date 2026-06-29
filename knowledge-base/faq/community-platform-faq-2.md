# Astron 智能体平台官方交流群 FAQ 汇总

> 本文档基于群聊记录自动归纳整理，涵盖部署安装、RPA 使用、Agent 功能、认证鉴权及常见报错排查等内容。

## 1. 部署与安装 (Deployment & Installation)

### 1.1 镜像拉取失败或超时怎么办？
- **现象**：`docker compose up` 拉取镜像卡住或报错。
- **解决方案**：
  1. 修改 `docker-compose.yaml`，将镜像地址中的 `ghcr.io/` 替换为南京大学镜像源 `ghcr.nju.edu.cn/`。
  2. 配置 Docker 国内镜像源（如 `https://docker.nju.edu.cn` 等）。
  3. 检查网络是否需要代理。

### 1.2 更新部署后数据或状态异常如何处理？
- **步骤**：
  1. 清理旧容器和卷：`docker compose -f docker-compose-with-auth.yaml down -v`
  2. 还原本地配置（可选）：`git restore docker`
  3. 重新启动：`docker compose -f docker-compose-with-auth.yaml up -d`
  4. 浏览器端清理缓存或使用无痕模式访问。

### 1.3 支持哪些操作系统？
- **服务端**：推荐 Linux (x86_64)，ARM 架构（如 Mac M1/M2）可能存在 SQL 初始化兼容性问题，需手动处理。Windows 可通过 WSL2 或 Docker Desktop 部署。
- **RPA 客户端**：仅支持 **Windows** 系统。

### 1.4 必须配置的环境变量有哪些？
- 参考文档 `DEPLOYMENT_GUIDE_WITH_AUTH_zh.md` 第 2.2 节。
- 核心配置包括讯飞开放平台的 `APP_ID`, `API_KEY`, `API_SECRET` 等，用于支持大模型和数字人能力。

---

## 2. Astron RPA 相关

### 2.1 客户端无法连接服务端 (RPA_URL)
- **原因**：Agent 服务端未正确指向 RPA 服务地址。
- **解决**：修改 Agent 部署目录下的 `.env` 文件，设置 `RPA_URL` 为 RPA 服务端的实际地址（如 `http://<server-ip>:8080`）。

### 2.2 常见报错处理
- **`send uuid empty`**：通常是客户端与服务端版本不一致，或连接未建立。建议更新到最新版本并重启客户端。
- **端口 `13160`/`13159` 问题**：这些是 RPA 内部调度服务端口，确保未被防火墙拦截或占用。
- **拾取不到元素**：检查是否安装了浏览器插件，或尝试重启客户端/浏览器。

### 2.3 RPA 流程参数传递
- **入参**：在 RPA 流程设计中定义“流程参数”，外部调用时传入对应 Key-Value。
- **出参**：通过 HTTP 请求节点或 Python 脚本返回 JSON 数据，后续节点可通过变量引用。

### 2.4 网页截图与验证码
- 使用“网页截图”原子能力。
- 对于 Canvas 上的文本或特殊验证码，可结合 OCR 或大模型图像识别能力处理。

---

## 3. Astron Agent 功能与使用

### 3.1 工作流创建失败或显示异常
- **现象**：创建工作流报错，或画布中没有“开始/结束”节点。
- **原因**：数据库表结构版本落后。
- **解决**：检查后端日志，若出现 `Unknown column 'module_id'` 或 `type` 等错误，需在数据库执行相应的 `ALTER TABLE` 语句补全字段（如 `alter table c_param add column module_id varchar(50) DEFAULT NULL`）。

### 3.2 知识库 (Knowledge Base) 问题
- **文件上传失败**：
  - 检查 MinIO 服务是否正常，端口（如 9000/9001）是否开放。
  - 检查 Agent 与 RAGFlow、MinIO 之间的网络连通性及环境变量配置。
- **RAGFlow 同步**：目前支持从 Agent 上传同步至 RAGFlow；直接在 RAGFlow 上传的文件需在 Agent 端进行关联操作才能使用。
- **Rerank 模型**：星火知识库默认启用 Rerank，具体配置项后续开放。

### 3.3 数字人 (Digital Human) 加载失败
- **检查配置**：确认 `APP_ID` 等鉴权信息是否正确配置。
- **HTTPS 问题**：如果非 HTTPS 部署，浏览器可能拦截麦克风/摄像头权限。尝试在 Chrome 中配置 `chrome://flags/#unsafely-treat-insecure-origin-as-secure` 将地址设为安全源。

### 3.4 变量使用
- **引用方式**：在节点输入框中使用 `{{变量名}}` 引用上游节点输出或全局变量。
- **迭代节点**：在迭代节点内部，使用当前迭代项变量（如 `item`）进行处理。

---

## 4. 认证与权限 (Casdoor)

### 4.1 登录后无限跳转 (Loop)
- **现象**：登录 Casdoor 成功后跳回应用，又跳回登录页。
- **解决**：修改 `astron-agent/docker/astronAgent/casdoor/conf/app.conf`，将 `initDataNewOnly = true` 改为 `false`，并重启 Casdoor 服务。

### 4.2 单点登录 (SSO) 集成
- 支持集成第三方登录（如微信、QQ、GitLab 等），具体参考 Casdoor 官方文档进行配置。

---

## 5. 开发与贡献

### 5.1 二次开发指南
- 推荐阅读 `docs/PROJECT_MODULES_zh.md` 了解项目模块结构。
- 后端采用微服务架构，需关注 `openapi-service`, `robot-service` 等核心模块。

### 5.2 开源版 vs 企业版
- **区别**：核心架构一致。部分云端专属功能（如特定高阶模型、复杂评测集）暂未完全开源，正在逐步对齐。
- **RPA**：开源版 RPA 客户端与平台版通用，但需注意配置对应的服务端地址。

---

## 6. 其他常见问题

- **数据库报错 `SQLSyntaxErrorException`**：通常是代码更新了但数据库未自动迁移。查看日志中的 SQL 错误，手动在数据库执行缺少的字段添加操作。
- **跨域问题 (CORS)**：前端调用后端接口报跨域错误时，检查 Nginx 代理配置或后端服务的 CORS 允许域名配置。
