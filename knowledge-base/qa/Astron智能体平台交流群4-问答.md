# 提取的问答对 (Extracted Q&A Pairs)

### Q: 
服务器docker镜像拉不下来，我本地用科学上网工具搞了个代理

### A: 
这个是怎么操作的

---
### Q: 
@某用户

### A: 
@某用户 看上去没啥问题

---
### Q: 
咱们的astronagent容器在windows的docker desktop中运行，对docker desktop的版本有指定要求吗？

### A: 
4.x+，最好用最新的稳定版

---
### Q: 
request returned 500 Internal Server Error for API route and version http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.52/containers/b50d4ac82181bbf3c26e67ed224c83a98d119d757552c4c86e60907bed7e79d5/json,? check if the server supports the requested API version

### A: 
请按照以下步骤逐一排查（操作前请务必备份重要数据）:
执行 docker compose -f docker-compose-with-auth.yaml down -v 清理容器和数据卷，该步骤会删除所有数据。
运行 git restore docker 清理 docker 目录下的改动，恢复为仓库版本。
将 ASTRON_AGENT_VERSION 环境变量设置为稳定版 v1.0.0-rc.x。
按照部署文档重新配置其余环境变量，确保取值正确。
执行 docker compose -f docker-compose-with-auth.yaml up -d 重新启动所有服务。
清理浏览器缓存，或直接使用无痕模式访问页面。

---
### Q: 
[视频]

### A: 
@某用户 麻烦发一下tenant的完整日志

---
### Q: 
w1th0ut：
https://github.com/iflytek/astron-agent开源项目存在安全漏洞请问这边收录吗？咱们这边没有答复吗？

### A: 
@某用户 我来收录下

---
### Q: 
看有日志，看了日志，也没看出来有什么问题，大家有遇到的吗？

### A: 
@某用户 你启动以后立刻按ctrl shift i，看下请求有没有报错的

---
### Q: 
这个配置文件里的数据库信息默认是没有配置的，是需要配置这里么？tenant日志的都是3306端口链接不上

### A: 
@某用户 看下.env中mysql的配置

---
### Q: 
我只修改了 ragflow的配置，其他的没有动，都是默认的值

### A: 
手动重启下mysql容器试试@某用户

---
### Q: 
[图片]

### A: 
@某用户 使用默认账号登录，账号 admin 密码 123

---
### Q: 
除了core-tenant  core-rpa这两个，其他都启动了

### A: 
@某用户 重启下mysql在重启tenant试试呢？

---
### Q: 
[图片]

### A: 
@某用户  越哥看下这个

---
### Q: 
@某用户，再启动core-tenant还是不行，并且aitools还坏了，不停 restarting

### A: 
@某用户 执行docker compose -f docker-compose-with-auth.yaml down -v 后执行 docker compose -f docker-compose-with-auth.yaml up -d试试呢

---
### Q: 
麻烦问下这一块需要配置什么地址呢

### A: 
@某用户 faq里应该有介绍的

---
### Q: 
core-tenant 和 core-aitools 让我停了

### A: 
@某用户 能远程嘛，你是按照文档部署的嘛，环境变量啥的都配置了不

---
### Q: 
[图片]

### A: 
@某用户 密码是123

---
### Q: 
[图片]

### A: 
@某用户 直接注册就行

---
### Q: 
“
您好，请问客户端可以切换组织吗？如果可以，请问如何切换组织？”

### A: 
@某用户 越哥辛苦帮忙看一下

---
### Q: 
@某用户，Python只负责Java调用py处理个别涉及llm节点内部执行的逻辑是么

### A: 
@某用户 Java 负责管理层 API（CRUD、认证、配置），工作流实际执行是 Python（Workflow Service 引擎）

---
### Q: 
请问AstronRPA可以在子流程中添加注释吗？

### A: 
@某用户 可以按上图这样添加注释

---
### Q: 
守望者：
RAGflow用默认CODE出错了

### A: 
@某用户 您可以检查下是否部署成功。RAGflow属于第三方组件，具体问题您可以网上查阅其官方文档

---
### Q: 
守望者：
astron-agent跳不到登录？

### A: 
@某用户 直接访问localhost:80可以吗？

---
### Q: 
守望者：
[图片]

### A: 
麻烦您发一下console-hub的日志，我找同事帮您看一下@某用户

---
### Q: 
守望者：
这样子可以？

### A: 
@某用户 您用下docker-compose logs -f astron-agent-console-hub 看看hub服务的日志

---
### Q: 
守望者：
没有这个服务

### A: 
@某用户 docker compose logs  查看日志  试下这个吧，替换为具体的服务名

---
### Q: 
在1.0.0-rc.9的版本里是没有，在最新的版本里？

### A: 
@某用户

---
### Q: 
只能在agent这个节点里使用是吗

### A: 
@某用户 目前是的，MCP当作工具节点来使用还没开放

---
### Q: 
好的 另外咱们后续有计划推出 Human in Loop的功能么

### A: 
@某用户 这个可以在issue上提个feature哦，我们会根据需求和优先级进行排期

---
### Q: 
@某用户，报错缺少企业团队ID

### A: 
@某用户 这个可以麻烦提个issue嘛

---
### Q: 
“Victor: 
我们开源的是个人版的吗？”

### A: 
可以直接使用团队版的功能@某用户

---
### Q: 
“Victor: 
添加成员的时候 是从casdoor里面搜索的用户吗？谢谢”

### A: 
@某用户 是的是的

---
### Q: 
“?? ?? ??: 
Astron?Agent 和?AstronRPA 怎么集成起来呀，同时启的话，一些公共的组件（比如 CASDOOR ）端口有冲突”

### A: 
@某用户 ?? ?? 您好，我这边是正常启动的，可否有相关报错信息

---
### Q: 
小强不脏得?：
@某用户，帮忙解答一下，服务端rpa-opensource-atlas容器启动后自动关闭，日志中提示内容“2026-01-08 09:47:35 Schema is synced, no changes to be made”

### A: 
@某用户 没问题啊

---
### Q: 
小强不脏得?：
@某用户。最后一步安装1个多小时了，还没有安装完成正常么

### A: 
@某用户 看FAQ文档

---
### Q: 
小强不脏得?：
[图片]

### A: 
@某用户 而且你这也不是安装目录，安装目录的呢，也确认一下

---
### Q: 
看下robot-service报什么错吧

### A: 
@某用户

---
### Q: 
先git pull一下最新代码，然后 docker compose -d up atlas 更新下数据库字段

### A: 
@某用户 更新之后可以了，感谢

---
### Q: 
安装的时候先本地卸载一下，把\data目录删掉

### A: 
注意一下这个，或者换一个目录

---
### Q: 
你看看robot-service日志吧

### A: 
@某用户 这个服务上没有看到报错日志，但是客户端data/logs/picker能看到，程序一直在死循环

---
### Q: 
@某用户  这个服务上没有看到报错日志，但是客户端data/logs/picker能看到，程序一直在死循环

### A: 
@某用户 老师，这个能帮忙看看应该从哪些方面排查呢？

---
### Q: 
@某用户，chat_bot_base表没有正确插入bot_template字段，ISSUE#834

### A: 
@某用户 感谢贡献，可以在这里看issue跟踪进度https://github.com/orgs/iflytek/projects/7

---
### Q: 
微苦板蓝根
请问一下，我想把本地服务作为插件给agent调用，这个黑名单怎么处理啊

### A: 
@某用户 你好，这边不建议将本地服务的的本地地址localhost和回环地址127.0.0.1作为插件的URL，如果你的平台和本地服务是部署在可以互相连接的网络下，可以使用本地服务的IPV4地址作为插件URL的host

---
### Q: 
微苦板蓝根
我这边用的是自个的IP呀

### A: 
@某用户 192.168在网段黑名单中，需要修改后端数据库表config_info_en

---
### Q: 
微苦板蓝根
不过我这边是改的config_info表

### A: 
你客气了，这个表名的差异是版本问题@某用户

---
### Q: 
ding
执行命令：docker compose up -d 
提示不匹配

### A: 
@某用户 启动的是docker-compose-macos.yml这个文件吗?

---
### Q: 
ding
[图片]

### A: 
@某用户 这个一键启动用的默认版本，版本不适配的话建议分步启动

---
### Q: 
https://github.com/iflytek/astron-agent/blob/main/docs%2FDEPLOYMENT_GUIDE_zh.md

### A: 
参考这份指南，不用修改

---
### Q: 
[图片]

### A: 
这里选变量

---
### Q: 
你用原石种果仁：
[图片]

### A: 
@某用户 这是哪个网站？

---
### Q: 
刘颖：
请问有人遇到过这个问题吗
---
自己本地部署的 Astron?Agent。创建工作流发布为api后，调用接口报错 {'code': 20001, 'message': 'Failed to get application from management platform', 'id': 'spf00160001@hf19bb61e7de8000b782', 'created': 1768287010302.7048}

### A: 
您好，调用的时候配置了api-key,app-id等相关信息吗@某用户

---
### Q: 
刘颖：
没有 app-id 的配置。这个我的测试代码
API_KEY = "<REDACTED>"
API_SECRET = "<REDACTED>"
API_Flowid = "7416646510245380096"
url = "http://127.0.0.1:80/workflow/v1/chat/completions"

headers = {
    "Content-Type": "application/json",
    # "Accept": "text/event-stream",
    "Authorization": "Bearer {API_KEY}:{API_SECRET}",
}

data = {
    "flow_id": "7243957477710561280",
    "parameters": {"AGENT_USER_INPUT": "你好"},
    "ext": {"bot_id": "3", "caller": "workflow"},
    "stream": False,
}
rep = requests.post(url=url, headers=headers, json=data)

### A: 
@某用户 这个代码里面的API_Flowid信息与您发的图中的数据不一致

---
### Q: 
刘颖：
import http.client
import json
import ssl

# ssl._create_default_https_context = ssl._create_unverified_context
API_KEY = "<REDACTED>"
API_SECRET = "<REDACTED>"
API_Flowid = "7416729381866803201"
# url = "http://xxx:80/workflow/v1/chat/completions"
host = "xxx"
port = 80

headers = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream",
    "Authorization": "Bearer {API_KEY}:{API_SECRET}",
}

data = {
    "flow_id": f"{API_Flowid}",
    "uid": "123",
    "parameters": {"AGENT_USER_INPUT": "你好"},
    "ext": {"bot_id": "5", "caller": "workflow"},
    "stream": False,
}
payload = json.dumps(data)

conn = http.client.HTTPConnection(host=host, port=port, timeout=120)
conn.request(
    "POST", "/workflow/v1/chat/completions", payload, headers, encode_chunked=True
)
res = conn.getresponse()

if data.get("stream"):
    while chunk := res.readline():
        print(chunk.decode("utf-8"))
else:
    data = res.readline()
    print(data.decode("utf-8"))

### A: 
@某用户 应该是没有正确替换变量导致的，使用下面代码试下， 把其中的url填写成真实的接口地址
import http.client
import json
from urllib.parse import urlparse

# ================= 系统绑定应用后给你的信息 =================
url = "http://xxx:80/workflow/v1/chat/completions"
API_KEY = "<REDACTED>"
API_SECRET = "<REDACTED>"
API_FLOWID = "7416729381866803201"
# ===========================================================

u = urlparse(url)

headers = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream",
    "Authorization": f"Bearer {API_KEY}:{API_SECRET}",
}

data = {
    "flow_id": API_FLOWID,
    "uid": "123",
    "parameters": {"AGENT_USER_INPUT": "你好"},
    "ext": {"bot_id": "5", "caller": "workflow"},
    "stream": False,
}
payload = json.dumps(data)

conn = http.client.HTTPConnection(
    host=u.hostname,
    port=u.port or 80,
    timeout=120
)

conn.request(
    "POST",
    u.path,         
    payload,
    headers,
    encode_chunked=True  
)

res = conn.getresponse()

if data.get("stream"):
    while True:
        chunk = res.readline()
        if not chunk:
            break
        print(chunk.decode("utf-8"))
else:
    result = res.read()
    print(result.decode("utf-8"))

---
### Q: 
 [图片]2025-12-26 11-27-36.png]

### A: 
   @某用户

---
### Q: 
 [图片]2025-12-26 11-27-36.png]

### A: 
[志]   @某用户

---
### Q: 
[志]   @某用户

### A: 
   @某用户 服务端部署了吗

---
### Q: 
   @某用户 服务端部署了吗

### A: 
[志]   @某用户

---
### Q: 
[志]   这是桌面安装后的目录

### A: 
   @某用户 等我们rpa的研发大佬给你看下哈

---
### Q: 
   @某用户 等我们rpa的研发大佬给你看下哈

### A: 
[志]   @某用户，阿里云或清华，昨天因为这个事，搞了很久，最后不得不搞了个代理

---
### Q: 
   前段时间还能用

### A: 
[志]   @某用户，帮忙看下我上面的问题哈

---
### Q: 
   你casdoor连得上吗

### A: 
[志]   @某用户

---
### Q: 
[Yan ？2？2？]   我试试

### A: 
   @某用户 ?2?2??怎么哪里都有你

---
### Q: 
   "Victor：
request returned 500 Internal Server Error for API route and version http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.52/containers/b50d4ac82181bbf3c26e67ed224c83a98d119d757552c4c86e60907bed7e79d5/json,? check if the server supports the requested API version"
------
请按照以下步骤逐一排查（操作前请务必备份重要数据）:
执行 docker compose -f docker-compose-with-auth.yaml down -v 清理容器和数据卷，该步骤会删除所有数据。
运行 git restore docker 清理 docker 目录下的改动，恢复为仓库版本。
将 ASTRON_AGENT_VERSION 环境变量设置为稳定版 v1.0.0-rc.x。
按照部署文档重新配置其余环境变量，确保取值正确。
执行 docker compose -f docker-compose-with-auth.yaml up -d 重新启动所有服务。
清理浏览器缓存，或直接使用无痕模式访问页面。

### A: 
[Victor]   @某用户 compose文件

---
### Q: 
   "Victor：
request returned 500 Internal Server Error for API route and version http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.52/containers/b50d4ac82181bbf3c26e67ed224c83a98d119d757552c4c86e60907bed7e79d5/json,? check if the server supports the requested API version"
------
请按照以下步骤逐一排查（操作前请务必备份重要数据）:
执行 docker compose -f docker-compose-with-auth.yaml down -v 清理容器和数据卷，该步骤会删除所有数据。
运行 git restore docker 清理 docker 目录下的改动，恢复为仓库版本。
将 ASTRON_AGENT_VERSION 环境变量设置为稳定版 v1.0.0-rc.x。
按照部署文档重新配置其余环境变量，确保取值正确。
执行 docker compose -f docker-compose-with-auth.yaml up -d 重新启动所有服务。
清理浏览器缓存，或直接使用无痕模式访问页面。

### A: 
[SeasOn]   @某用户

---
### Q: 
   "Victor：
[视频]"
------
@某用户 麻烦发一下tenant的完整日志

### A: 
[Victor]   @某用户

---
### Q: 
   "w1th0ut：
https://github.com/iflytek/astron-agent开源项目存在安全漏洞请问这边收录吗？咱们这边没有答复吗？"
------
@某用户 我来收录下

### A: 
[Victor]   @某用户

---
### Q: 
   "Victor：
这个配置文件里的数据库信息默认是没有配置的，是需要配置这里么？tenant日志的都是3306端口链接不上"
------
@某用户 看下.env中mysql的配置

### A: 
[Victor]   @某用户

---
### Q: 
   按照部署文档来就行，这里不需要改的

### A: 
[Victor]   @某用户，再启动core-tenant还是不行，并且aitools还坏了，不停 restarting

---
### Q: 
   单独启动这个试下呢 docker/astronAgent/docker-compose-auth.yml

### A: 
[Victor]   @某用户

---
### Q: 
   工作流能创建，并且运行嘛

### A: 
[Victor]   @某用户

---
### Q: 
   "SeasOn
麻烦问下这一块需要配置什么地址呢"
------
@某用户 faq里应该有介绍的

### A: 
[SeasOn]   @某用户

---
### Q: 
[张彬] [图片]2025-12-31 09-40-27.png]

### A: 
   @某用户 https://www.xfyun.cn/doc/spark/Agent03-%E5%BC%80%E5%8F%91%E6%8C%87%E5%8D%97.html#_8-2-%E4%B8%AA%E4%BA%BA%E6%A8%A1%E5%9E%8B 您可以看一下这个文档

---
### Q: 
   您好，请问客户端可以切换组织吗？如果可以，请问如何切换组织？

### A: 
   @某用户 可以先看一下这个文档，进入casdoor页面进行组织相关的设置https://github.com/iflytek/astron-agent/blob/main/docs/DEPLOYMENT_GUIDE_WITH_AUTH_zh.md

---
### Q: 
[Victor]   咱们的应用 创建后 不能删除吗

### A: 
   @某用户 https://www.xfyun.cn/doc/spark/Agent03-%E5%BC%80%E5%8F%91%E6%8C%87%E5%8D%97.html#_5-2-%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8F%92%E4%BB%B6您可以看一下文档，发布后的智能体需要下架之后才能进行删除，在资源管理这一栏

---
### Q: 
   @某用户 https://www.xfyun.cn/doc/spark/Agent03-%E5%BC%80%E5%8F%91%E6%8C%87%E5%8D%97.html#_5-2-%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8F%92%E4%BB%B6您可以看一下文档，发布后的智能体需要下架之后才能进行删除，在资源管理这一栏

### A: 
[Victor]   @某用户

---
### Q: 
   您可以先尝试一下在我的智能体中找到对应智能体卡片，卡片右下角应该会有删除按钮

### A: 
[Victor]   @某用户

---
### Q: 
[Victor]   @某用户

### A: 
   @某用户 astron agent与现网的星辰智能体有所不同，智能体调试通过之后可直接成功发布，没有审核流程

---
### Q: 
[Victor]   最后一个图片，和工作流里点击发布 导向的最终页面是一样的。所以我感觉是没有发布成功

### A: 
   @某用户 您这边方便给我们提一个issue吗，我们会在后期尽快排期修复，另外您提到的审核流程，也可以在issue中说明，我们后续也会考虑支持这一操作

---
### Q: 
[Victor]   不客气，共同完善

### A: 
   @某用户

---
### Q: 
   @某用户

### A: 
[Victor]   @某用户

---
### Q: 
   发布管理-选择已发布-在已发布中找到需要下线的智能体，点击下线，这样也找不到吗

### A: 
[Victor]   @某用户

---
### Q: 
[Victor]   @某用户

### A: 
   @某用户 我刚才试了一下好像也没有下线操作，无法把已发布的智能体下线，方便在您之前提的issue上进行补充吗，我们会尽快排期修复一下这个

---
### Q: 
   @某用户 我刚才试了一下好像也没有下线操作，无法把已发布的智能体下线，方便在您之前提的issue上进行补充吗，我们会尽快排期修复一下这个

### A: 
[Victor]   @某用户

---
### Q: 
   "MRFF：
@某用户，Python只负责Java调用py处理个别涉及llm节点内部执行的逻辑是么"
------
@某用户 Java 负责管理层 API（CRUD、认证、配置），工作流实际执行是 Python（Workflow Service 引擎）

### A: 
[MRFF]   @某用户，python只负责解析工作流，并且执行工作流任务是么

---
### Q: 
   对的

### A: 
[MRFF]   @某用户

---
### Q: 
 [图片]2026-01-05 16-38-19.png]

### A: 
   @某用户，我之前也遇到过这个问题

---
### Q: 
   @某用户，我之前也遇到过这个问题

### A: 
   @某用户 好的，谢谢！

---
### Q: 
   好的

### A: 
[MRFF]   @某用户，没找到登录接口，不想使用casdoor

---
### Q: 
   https://github.com/iflytek/astron-agent/issues/751  会的，在后续排期之中，可以关注下这个issue

### A: 
[MRFF]   @某用户，报错缺少企业团队ID

---
### Q: 
[Victor]   咱们开源版本工作流的可观测性上是不是也没有啊？没有追踪

### A: 
[MRFF]   @某用户，调试的时候有

---
### Q: 
   “?? ?? ??: 
Astron?Agent 和?AstronRPA 怎么集成起来呀，同时启的话，一些公共的组件（比如 CASDOOR ）端口有冲突”
------
@某用户 ?? ?? 您好，我这边是正常启动的，可否有相关报错信息

### A: 
[MRFF]   @某用户：ID#811

---
### Q: 
 [图片]2026-01-07 12-18-14.png]

### A: 
   @某用户，帮忙解答一下，服务端rpa-opensource-atlas容器启动后自动关闭，日志中提示内容“2026-01-08 09:47:35 Schema is synced, no changes to be made”

---
### Q: 
   检查下robot-service日志吧

### A: 
   @某用户，感谢

---
### Q: 
   检查下robot-service日志吧

### A: 
   @某用户，帮忙指导一下，构建客户端，官方python要求是3.13.x，我的环境python==3.13.11 
`pywinhook==1.6.2`这个包安装失败

---
### Q: 
 [图片]2026-01-07 12-18-14.png]

### A: 
   @某用户，是否有稳定版本给我一份

---
### Q: 
 [图片]2026-01-08 13-36-46.png]

### A: 
   @某用户。最后一步安装1个多小时了，还没有安装完成正常么

---
### Q: 
   "小强不脏得?：
[图片]"
------
@某用户 而且你这也不是安装目录，安装目录的呢，也确认一下

### A: 
   @某用户 老师，我这边点击新增参数，总是出现这个报错，是操作不对吗？

---
### Q: 
   先git pull一下最新代码，然后 docker compose -d up atlas 更新下数据库字段

### A: 
   @某用户 想问一下，配本地xinference上的大模型，也是这两个参数就够了吗？

---
### Q: 
   要把data目录删一下

### A: 
   @某用户 更新之后拾取新元素点击完成就报502了

---
### Q: 
 [图片]2026-01-09 13-49-28.jpg]

### A: 
[MRFF]   @某用户，chat_bot_base表没有正确插入bot_template字段，ISSUE#834

---
### Q: 
[ding]   请问astron支持arm架构的Mac吗

### A: 
   @某用户

---
### Q: 
 [图片]2026-01-12 13-50-20.png]

### A: 
   @某用户@某用户，有rpa的使用文档么？

---
### Q: 
   这里都能选变量啊

### A: 
   @某用户，这种怎么处理

原值：//tr[{target_row_i}]
解析为：//tr[1]

---
### Q: 
   "
[图片]"
------
这里选变量

### A: 
   @某用户，感谢老师

---
### Q: 
   "
[图片]"
------
这里选变量

### A: 
   @某用户  老师，我们想用自己本地Xinference上部署的大模型，按QA的指引配置了AICHAT_BASE_URL和AICHAT_API_KEY的参数，但是使用单轮会话返回为空且无报错（我们使用自定义脚本去调，是能正常使用的）

---
