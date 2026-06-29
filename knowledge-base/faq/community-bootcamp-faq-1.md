# Astron Agent & RPA 常见问题精选 (Refined FAQ)

根据社群聊天记录整理的常见问题解答，按主题分类。

## 1. 课程与直播相关

**Q: 直播课程在哪里观看？手机可以看吗？**
A: 
- 电脑端：访问 [Astron Camp 官网](https://www.aidaxue.com/astronCamp)。
- 手机端：进入【讯飞开放平台】小程序观看。手机和电脑均可观看。

**Q: 直播时长一般是多久？**
A: 每场直播大约 30-40 分钟。

**Q: 错过了直播有回放吗？**
A: 有回放。直播结束后，回放视频会上线到训练营官网，大家可以随时观看。

**Q: 我是零基础，可以学习吗？**
A: 可以的。建议先阅读学习手册，按部就班进行学习。

**Q: 如何进行打卡？**
A: 直接观看直播即可。后续可以在训练营官网页面提交课程作业作为打卡。

## 2. 环境部署与 Docker

**Q: Docker 镜像拉取失败，国内有哪些镜像源推荐？**
A: 
1. **Astron Agent 项目镜像**：编辑 `docker/astronAgent/docker-compose.yaml`，将 `image` 字段中的 `ghcr.io/` 前缀替换为 `ghcr.nju.edu.cn/`。
2. **第三方中间件镜像**：配置 Docker Daemon 使用国内镜像源，例如：
   - `https://docker.nju.edu.cn`
   - `https://docker.xuanyuan.me`
   - `https://docker.mirrors.ustc.edu.cn`

**Q: 安装 Docker 时找不到 "Virtual machine platform"？**
A: 在 Windows 功能中，该选项中文名为“虚拟机平台”，请勾选该选项。

**Q: 部署时端口需要特意分配吗？**
A: 一般不需要特意分配，Docker 会映射端口。如果遇到问题，请检查防火墙或端口占用情况。RPA 服务端默认端口为 32742 和 8000。

**Q: 云服务器（如 Ubuntu）安装部署总是失败怎么办？**
A: 建议参考直播中的部署演示。如果是源的问题，请尝试更换国内的 apt/yum 源以及 Docker 镜像源。

**Q: 添加本地部署的模型报错，提示 IP 在黑名单？**
A: 这是因为触发了网段黑名单限制。
**解决方法**：进入 `astron-agent-mysql` 容器，连接数据库，执行 SQL 删除配置：
`delete from astron_console.config_info where category = 'NETWORK_SEGMENT_BLACK_LIST';`
或者清空相关字段值。

## 3. Astron RPA 相关

**Q: RPA 客户端安装后卡住，或者无法配置服务端地址？**
A: 
- 客户端配置文件位于安装目录下，可以手动修改配置文件中的服务端地址。
- 默认服务端端口是 `32742` (在 `docker-compose.yaml` 中配置)。

**Q: 启动 RPA 客户端报错，或者界面显示异常？**
A: 
- 如果是在较老的电脑或云桌面上，可能是因为缺少或版本过低导致的 `Microsoft Edge WebView2 Runtime` 问题。请尝试更新 WebView2 Runtime。
- 官方后续计划迁移到 Electron 框架以规避此问题。

**Q: 本地部署 RPA 服务器，需要对外开放哪些端口？**
A: 如果没有修改默认配置，需要开放 **32742** (RPA服务) 和 **8000** (管理后台) 端口。

## 4. 功能配置与 API (OCR/大模型)

**Q: 怎么配置讯飞 API Key？**
A: 请参考《安装部署指南》。需要在讯飞开放平台申请应用的 AppID, APIKey, APISecret，并将这些信息配置到项目的 `.env` 文件中。

**Q: OCR 识别为空，或文生图插件无法使用？**
A: 
1. 确认 `.env` 文件中是否已正确配置了开放平台的 APP 相关信息。
2. 确认在讯飞开放平台是否领取了对应能力（如 OCR、文生图）的免费额度。
3. 如果配置无误仍无法使用，尝试刷新浏览器或联系技术支持排查。

**Q: 调用第三方工具报错 "Third-party tool request failed ... SSL record layer failure"？**
A: 这通常是 SSL 连接问题，可能是网络环境或证书问题导致容器无法连接外部 API。开发团队已知晓并正在排查优化。

## 5. 其他问题

**Q: 公众号回复信息是旧的？**
A: 后台已同步更新，请重试。

**Q: 手机端如何登录？**
A: 在登录页面点击右上方切换成“手机号登录”模式。
