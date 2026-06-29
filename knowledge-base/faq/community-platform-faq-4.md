# Astron 智能体平台常见问题解答 (FAQ)

本文档整理自官方交流群的问答记录，涵盖部署安装、配置连接、功能使用及故障排查等常见问题。

## 目录

1.  [部署与安装](#部署与安装)
2.  [配置与网络](#配置与连接)
3.  [功能与使用](#功能使用)
4.  [故障排查](#故障排查)
5.  [开发与API](#开发与api)

---

## <a id="部署与安装"></a>1. 部署与安装

**Q: 服务器拉取 Docker 镜像失败怎么办？**
A: 如果服务器无法拉取 Docker 镜像，通常是因为网络问题。可以尝试在本地配置代理工具，或配置 Docker 使用国内镜像源（如阿里云、清华源等）。如果仍然不行，可以尝试配置 HTTP/HTTPS 代理环境变量给 Docker 守护进程。

**Q: Windows 上运行 Astron Agent 对 Docker Desktop 版本有要求吗？**
A: 有要求。建议使用 Docker Desktop 4.x 及以上版本，最好是由于最新的稳定版。

**Q: 启动时遇到 `request returned 500 Internal Server Error for API route ... check if the server supports the requested API version` 报错？**
A: 这通常是 Docker API 版本不匹配或环境状态不一致导致的。请尝试以下步骤：
1.  备份重要数据。
2.  执行 `docker compose -f docker-compose-with-auth.yaml down -v` 清理容器和数据卷（注意：此步骤会删除数据）。
3.  运行 `git restore docker` 恢复 docker 目录下的文件修改。
4.  检查环境变量 `ASTRON_AGENT_VERSION` 是否设置为稳定版（如 `v1.0.0-rc.x`）。
5.  重新执行 `docker compose -f docker-compose-with-auth.yaml up -d` 启动服务。
6.  清理浏览器缓存或使用无痕模式访问。

**Q: 启动后 `core-tenant` 或 `core-aitools` 服务一直重启，且报错连不上数据库（3306端口）？**
A:
1.  检查 `.env` 文件中的 MySQL 配置是否正确。
2.  尝试手动重启 MySQL 容器：`docker restart astron-agent-mysql`（具体容器名请通过 `docker ps` 确认）。
3.  如果问题依旧，尝试执行 `docker compose down -v` 清理后重新启动。

**Q: 服务端 `rpa-opensource-atlas` 容器启动后自动关闭，日志提示 `Schema is synced`，正常吗？**
A: 这是正常的。Atlas 容器通常用于数据库 Schema 的迁移和同步，任务完成后会自动退出。只要日志显示 "Schema is synced, no changes to be made" 或类似成功信息即可。

**Q: 客户端安装卡在最后一步很久（超过1小时）怎么办？**
A: 请检查安装目录是否正确，并参考官方 FAQ 文档。有时需要先卸载旧版本，并手动删除残留的 `\data` 目录后重新安装。

**Q: Astron 支持 ARM 架构的 Mac 吗？**
A: 支持。如果是 Mac 用户，请使用 `docker-compose-macos.yml` 进行启动。如果遇到版本不匹配问题，建议检查镜像标签或分步启动。

---

## <a id="配置与连接"></a>2. 配置与网络

**Q: 如何配置本地服务（如本地部署的大模型）给 Agent 调用？**
A:
1.  **网络互通**：确保 Docker 容器内的服务能访问到宿主机或局域网内的服务。
    *   不要使用 `localhost` 或 `127.0.0.1`，因为这会指向容器自身。
    *   使用宿主机的局域网 IP（如 `192.168.x.x`）或 Docker 的特殊 DNS `host.docker.internal`（视 Docker 版本和系统而定）。
2.  **黑名单限制**：默认配置可能禁止连接私有网段（如 `192.168.x.x`）。如果遇到拦截，需要修改数据库表 `config_info` (或 `config_info_en`) 中的黑名单配置。

**Q: 如何配置本地 Xinference 部署的大模型？**
A: 配置 `AICHAT_BASE_URL` 和 `AICHAT_API_KEY` 环境变量。确保 Base URL 能被容器访问（参考上一条网络配置）。如果配置后单轮对话返回空，请检查 API 格式是否兼容 OpenAI 标准。

**Q: 默认的管理员账号和密码是什么？**
A: 默认账号：`admin`，默认密码：`123`。

---

## <a id="功能使用"></a>3. 功能与使用

**Q: 客户端可以切换组织吗？**
A: 可以。客户端登录基于 Casdoor 认证。请参考 [带认证的部署指南](https://github.com/iflytek/astron-agent/blob/main/docs/DEPLOYMENT_GUIDE_WITH_AUTH_zh.md)，在 Casdoor 管理页面进行组织和用户的配置。

**Q: 已发布的应用如何删除或下架？**
A:
*   目前版本（开源版）可能在界面上未直接提供“下架”按钮。
*   通常需要在“我的智能体”卡片中查找删除选项。
*   如果找不到下架/删除入口，可能是当前版本的已知问题（Issue），建议关注 GitHub 仓库的修复进度。

**Q: AstronRPA 可以在子流程中添加注释吗？**
A: 可以。在流程设计器中支持添加注释功能。

**Q: 工作流的运行机制是怎样的？Java 和 Python 分别负责什么？**
A:
*   **Java (Core)**: 负责管理层 API，包括 CRUD 操作、用户认证、配置管理等。
*   **Python (Workflow Service)**: 负责工作流引擎的实际执行，解析工作流逻辑并调度节点。
两者连接同一个数据库。

---

## <a id="故障排查"></a>4. 故障排查

**Q: 页面访问报错或加载不出来，如何排查？**
A:
1.  **浏览器控制台**：按 `Ctrl + Shift + I` (Windows) 或 `Cmd + Option + I` (Mac) 打开开发者工具，查看 Network 面板是否有请求报错（红色 4xx/500 错误）。
2.  **查看容器日志**：
    *   查看所有日志：`docker compose logs -f`
    *   查看特定服务日志：`docker compose logs -f <服务名>` (例如 `astron-agent-console-hub`, `astron-agent-core-tenant`)。
    *   特别关注 `core-tenant` (租户服务) 和 `console-hub` (控制台后端) 的日志。

**Q: 数据库更新或字段缺失导致报错怎么办？**
A: 尝试拉取最新代码 (`git pull`)，然后运行 `docker compose up -d atlas` 来执行数据库迁移，更新字段。

**Q: 客户端程序一直在死循环或报错？**
A: 检查 `data/logs/picker` 或 `robot-service` 的日志。有时需要清理本地缓存数据（删除 `data` 目录）后重试。

---

## <a id="开发与api"></a>5. 开发与 API

**Q: 通过 API 调用工作流报错 `Failed to get application`？**
A:
1.  **检查鉴权信息**：确保 Header 中正确传递了 `Authorization: Bearer {API_KEY}:{API_SECRET}`。
2.  **检查 ID 匹配**：
    *   确保使用的 `flow_id` 与发布的 API ID 一致。
    *   注意区分 `App ID` 和 `Flow ID`。
    *   确认请求 URL 中的 Host 和 Port 是否正确（指向 `console-hub` 或网关端口）。
3.  **参数替换**：如果是从示例代码复制，确保 `xxx` 等占位符已替换为实际值。

**Q: 想要将本地服务作为插件接入，有什么限制？**
A: 同[配置与网络](#配置与连接)部分，注意内网 IP 黑名单限制，需要修改数据库配置允许访问本地 IP。

---

> **注意**：Astron Agent 和 AstronRPA 处于快速迭代中，遇到问题建议先查看 [GitHub Issues](https://github.com/iflytek/astron-agent/issues) 是否已有解决方案，或更新到最新版本尝试。
