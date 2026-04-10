## 1. 架构设计

```mermaid
graph TD
  A[用户浏览器] --> B[React前端应用]
  B --> C[/api/chat 代理 (Vercel Serverless)]
  C --> D[MAAS Chat Completions API]
  
  subgraph "前端层"
    B
  end
  
  subgraph "外部服务层"
    D
  end
```

## 2. 技术描述

- 前端: React@18 + tailwindcss@3 + vite
- 初始化工具: vite-init
- 后端: 通过 Vercel Serverless Functions 提供 `/api/chat` 代理，避免浏览器 CORS 且不暴露密钥
- AI模型配置: astroncodingplan/astron-code-latest

## 3. 路由定义

| 路由 | 用途 |
|-------|---------|
| /chat | AI聊天页面，提供智能对话界面 |

## 4. API定义

### 4.1 AI聊天API

```
POST /api/chat
```

请求头:
```
Content-Type: application/json
```

说明:
- 上游 `Authorization` 由服务端注入（环境变量 `ASTRON_MAAS_API_KEY`），前端不直接持有密钥

请求体:
| 参数名 | 参数类型 | 是否必需 | 描述 |
|-----------|-------------|-------------|-------------|
| model | string | true | 模型名称: astron-code-latest |
| messages | array | true | 对话消息数组 |
| max_tokens | number | false | 最大token数: 32768 |
| temperature | number | false | 温度参数: 0.7 |

响应:
| 参数名 | 参数类型 | 描述 |
|-----------|-------------|-------------|
| choices | array | AI回复消息数组 |
| usage | object | token使用量统计 |

示例:
```json
{
  "model": "astron-code-latest",
  "messages": [
    {"role": "user", "content": "你好，请帮我写一个React组件"}
  ],
  "max_tokens": 32768,
  "temperature": 0.7
}
```

## 5. 前端实现要点

### 5.1 状态管理
- 使用React useState管理聊天消息状态
- 使用useRef管理消息输入和滚动位置
- 使用localStorage保存聊天记录

### 5.2 API调用封装
```typescript
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  model: string
  messages: ChatMessage[]
  max_tokens?: number
  temperature?: number
}
```

### 5.3 错误处理
- 网络错误重试机制
- API限流处理
- 用户友好的错误提示

### 5.4 性能优化
- 消息列表虚拟滚动
- API请求防抖
- 组件懒加载
