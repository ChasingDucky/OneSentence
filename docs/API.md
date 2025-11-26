# API 文档

One Sentence Today 后端 API 文档

## 基础信息

- **Base URL**: `http://localhost:5000/api`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON

---

## 认证

### 注册用户

**POST** `/auth/register`

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "isGuest": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 用户登录

**POST** `/auth/login`

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "isGuest": false,
    "lastActive": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 获取当前用户信息

**GET** `/auth/me`

**Headers**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "isGuest": false,
    "isVerified": true,
    "preferences": {},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastActive": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## 消息

### 发布今日消息

**POST** `/messages`

**Headers**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "text": "今天天气真好！",
  "language": "zh"
}
```

**响应**:
```json
{
  "message": "Message posted successfully",
  "data": {
    "msg_id": 123,
    "anon_id": "uuid-here",
    "text": "今天天气真好！",
    "created_at": "2024-01-01T12:00:00.000Z",
    "language": "zh"
  }
}
```

**错误响应**:
```json
{
  "error": "You have already posted today",
  "message": { ... }
}
```

或

```json
{
  "error": "Content not allowed",
  "reason": "Contains personal information (email/phone/social account)"
}
```

---

### 获取今日消息

**GET** `/messages/today`

**Headers**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "sent": {
    "msg_id": 123,
    "text": "今天天气真好！",
    "created_at": "2024-01-01T12:00:00.000Z",
    "language": "zh"
  },
  "received": {
    "text": "希望明天会更好",
    "createdAt": "2024-01-01T11:30:00.000Z",
    "language": "zh",
    "reactionCount": 5,
    "pairingId": 456
  },
  "hasSent": true,
  "hasReceived": true
}
```

---

### 获取历史消息

**GET** `/messages/history?limit=30`

**Headers**:
```
Authorization: Bearer <token>
```

**参数**:
- `limit` (optional): 返回消息数量，默认 30

**响应**:
```json
{
  "messages": [
    {
      "msg_id": 123,
      "text": "今天天气真好！",
      "created_at": "2024-01-01T12:00:00.000Z",
      "language": "zh",
      "reaction_count": 3,
      "favorite_count": 1
    },
    ...
  ],
  "count": 15
}
```

---

### 获取单条消息

**GET** `/messages/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "message": {
    "msg_id": 123,
    "anon_id": "uuid-here",
    "text": "今天天气真好！",
    "created_at": "2024-01-01T12:00:00.000Z",
    "language": "zh"
  }
}
```

---

## 反应

### 添加反应

**POST** `/reactions/:msgId`

**Headers**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "reactionType": "resonate"
}
```

**可用反应类型**:
- `resonate` - 共鸣
- `curious` - 好奇
- `applause` - 鼓掌
- `want_more` - 想知道更多

**响应**:
```json
{
  "message": "Reaction added successfully",
  "reaction": {
    "reaction_id": 789,
    "msg_id": 123,
    "anon_id": "uuid-here",
    "reaction_type": "resonate",
    "created_at": "2024-01-01T12:30:00.000Z"
  }
}
```

---

### 删除反应

**DELETE** `/reactions/:msgId`

**Headers**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "message": "Reaction removed successfully"
}
```

---

### 收藏消息

**POST** `/reactions/favorites/:msgId`

**Headers**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "message": "Message favorited successfully",
  "favorite": {
    "favorite_id": 999,
    "msg_id": 123,
    "anon_id": "uuid-here",
    "created_at": "2024-01-01T12:30:00.000Z"
  }
}
```

---

### 取消收藏

**DELETE** `/reactions/favorites/:msgId`

**Headers**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "message": "Favorite removed successfully"
}
```

---

### 获取收藏列表

**GET** `/reactions/favorites`

**Headers**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "favorites": [
    {
      "favorite_id": 999,
      "msg_id": 123,
      "text": "希望明天会更好",
      "message_created_at": "2024-01-01T11:30:00.000Z",
      "language": "zh",
      "created_at": "2024-01-01T12:30:00.000Z"
    },
    ...
  ],
  "count": 5
}
```

---

## 举报

### 举报消息

**POST** `/reports/:msgId`

**Headers**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "reason": "包含不当内容，请审核处理"
}
```

**响应**:
```json
{
  "message": "Report submitted successfully",
  "report": {
    "report_id": 111,
    "msg_id": 123,
    "reporter_anon_id": "uuid-here",
    "reason": "包含不当内容，请审核处理",
    "status": "pending",
    "created_at": "2024-01-01T13:00:00.000Z"
  }
}
```

---

### 获取举报列表（管理员）

**GET** `/reports?status=pending`

**Headers**:
```
Authorization: Bearer <admin-token>
```

**参数**:
- `status` (optional): 过滤状态，可选值：`pending`, `reviewed`, `resolved`, `dismissed`

**响应**:
```json
{
  "reports": [
    {
      "report_id": 111,
      "msg_id": 123,
      "message_text": "被举报的消息内容",
      "reporter_anon_id": "uuid-here",
      "reason": "包含不当内容，请审核处理",
      "status": "pending",
      "created_at": "2024-01-01T13:00:00.000Z"
    },
    ...
  ],
  "count": 3
}
```

---

## 管理员

### 手动触发配对

**POST** `/admin/pairing/run`

**Headers**:
```
Authorization: Bearer <admin-token>
```

**响应**:
```json
{
  "message": "Pairing completed",
  "result": {
    "success": true,
    "pairingsCreated": 20,
    "totalMessages": 21,
    "unpaired": 1
  }
}
```

---

### 获取统计信息

**GET** `/admin/stats`

**Headers**:
```
Authorization: Bearer <admin-token>
```

**响应**:
```json
{
  "stats": {
    "total_users": 1000,
    "new_users_today": 15,
    "messages_today": 50,
    "pairings_today": 48,
    "pending_reports": 2
  }
}
```

---

## 错误响应

### 通用错误格式

```json
{
  "error": "Error message here"
}
```

### 验证错误

```json
{
  "errors": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    },
    {
      "field": "password",
      "message": "\"password\" length must be at least 8 characters long"
    }
  ]
}
```

### HTTP 状态码

- `200` - 成功
- `201` - 创建成功
- `400` - 请求错误（验证失败、业务逻辑错误）
- `401` - 未认证（token 缺失或无效）
- `403` - 权限不足
- `404` - 资源不存在
- `429` - 请求过于频繁
- `500` - 服务器内部错误

---

## 速率限制

默认限制：每 15 分钟最多 100 个请求

超出限制会返回：
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

HTTP 状态码：`429`

---

## 示例代码

### JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加认证 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 注册
const register = async () => {
  const response = await api.post('/auth/register', {
    email: 'user@example.com',
    password: 'password123',
  });
  localStorage.setItem('token', response.data.token);
};

// 发布消息
const postMessage = async (text) => {
  const response = await api.post('/messages', {
    text,
    language: 'zh',
  });
  return response.data;
};

// 获取今日消息
const getTodayMessages = async () => {
  const response = await api.get('/messages/today');
  return response.data;
};
```

### Python (requests)

```python
import requests

BASE_URL = 'http://localhost:5000/api'

# 注册
response = requests.post(f'{BASE_URL}/auth/register', json={
    'email': 'user@example.com',
    'password': 'password123'
})
token = response.json()['token']

# 发布消息
headers = {'Authorization': f'Bearer {token}'}
response = requests.post(f'{BASE_URL}/messages',
    json={'text': '今天天气真好！', 'language': 'zh'},
    headers=headers
)

# 获取今日消息
response = requests.get(f'{BASE_URL}/messages/today', headers=headers)
data = response.json()
```

---

## Postman Collection

可以导入以下 Postman Collection 进行测试：

[下载 Postman Collection](./postman_collection.json)

---

## 更多信息

- [部署文档](./DEPLOYMENT.md)
- [开发指南](../README.md)
