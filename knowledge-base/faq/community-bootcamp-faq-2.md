# Astron Agent & RPA 常见问题精选 (Refined FAQ)

基于社群聊天记录整理的高频问题与解答。

## 1. 课程与资料 (Course & Materials)

**Q: 直播有回放和PPT文档吗？**
A: 有的。直播回放和PPT后续都会上传到训练营学习官网。
- **官网链接**: [https://www.aidaxue.com/astronCamp](https://www.aidaxue.com/astronCamp)
- **学习手册**: [https://t.xfyun.cn/1VvHCG](https://t.xfyun.cn/1VvHCG)

**Q: 课程只能在手机上看吗？**
A: 手机和电脑都可以观看。
- **电脑端**: 访问上述官网链接。
- **手机端**: 可通过【讯飞开放平台】视频号或官网链接观看。

**Q: 哪里可以看到课程中的演示案例？**
A: 训练营课程视频、学习手册中都有详细演示。此外，也可以关注 GitHub 上的 `Awesome-Astron-Workflow` 仓库获取更多案例。

**Q: 英语作文智能体等特定案例的使用步骤哪里有？**
A: 第三课（《多节点组合搭建优质工作流智能体》）会详细讲解创建过程和使用步骤。

---

## 2. 功能与特性 (Features)

**Q: 开源版本的功能会有阉割吗？**
A: **没有阉割**。开源版包含基本上所有的主要功能。目前仅有少量功能（如鉴权相关）还在云端体验中，后续会根据排期逐步同步到开源版中。

**Q: 智能体使用前需要先下载吗？**
A: 需要进行本地部署。
- **流程**: 本地部署 (Docker) -> 设计智能体/工作流 -> 导出文件 -> (可选) 到讯飞星辰 Agent 平台复现。

**Q: `SPARK_RTASR_API_KEY` 服务需要单独购买吗？**
A: 是的，该服务需要单独购买。不过新用户通常有免费试用福利，可以前往讯飞开放平台 ([https://www.xfyun.cn/services/rtasr](https://www.xfyun.cn/services/rtasr)) 认领。

---

## 3. 部署与配置 (Deployment & Configuration)

**Q: Casdoor 和 Ragflow 的默认账号密码是什么？**
A: 
- **Ragflow**: 需要自己注册账号密码。
- **Casdoor**: 默认账号为 `admin`，默认密码为 `123`。登录 Casdoor 控制台后可以自行更改。

**Q: 拉取代码或 Docker 镜像时速度慢、报错、超时怎么办？**
A: 这通常是由于国内网络连接 GitHub 或 Docker Hub 不稳定导致的。
**解决方案**:
1. **配置镜像源**: 在 Docker 设置中配置国内加速镜像源。
2. **使用代理**: 开启网络代理（"魔法"）进行拉取。
3. **使用国内仓库**: 尝试从 Gitee 镜像仓库拉取 (如: `https://gitee.com/iflytek/astron-agent`)。

**Q: 服务启动失败 (如 `astron-core-link` returned non-zero exit status 1) 如何排查？**
A: 
1. **检查端口**: 可能是端口冲突被占用，请检查相关端口的使用情况。
2. **查看日志**: 使用 `docker logs <container_name>` 查看详细报错日志以定位问题。

**Q: Casdoor 支持 HTTPS 吗？**
A: 目前 Astron 内置的 Casdoor 配置可能不支持直接开启 HTTPS。建议在 Casdoor 服务前添加一层 **Nginx 反向代理** 来处理 SSL/HTTPS 加密。

**Q: 如何更新项目代码？**
A: 推荐使用 Git 命令进行更新：
```bash
git checkout main
git pull origin main
```
如果不熟悉 Git，也可以下载最新的压缩包覆盖（需注意配置文件备份）。

---

## 4. 其他 (Others)

**Q: 遇到技术问题去哪里反馈？**
A: 
1. **GitHub Issues**: 可以在项目 GitHub 仓库提交 Issue。
2. **社群提问**: 在训练营社群内提问，会有技术老师或助教解答。
