# Task 54: Lark Bot Integration + Environment Variables

**Phase:** Phase 3 Optimizations - Task 7-9
**Date:** 2026-04-06
**Status:** Completed

## What Was Done

### Lark API Helper (`src/lib/lark.ts`)
- `getLarkTenantToken()`: 获取飞书 tenant_access_token，带内存缓存（60s buffer 提前刷新）
- `replyLarkMessage()`: 通过飞书 API 回复消息

### Lark Webhook (`src/app/api/lark-webhook/route.ts`)
- 支持飞书 URL Verification challenge 验证
- Verification Token 校验
- 仅处理 `im.message.receive_v1` 文本消息事件
- 从消息中提取 URL，调用 `quickImportArticle()` 导入
- 支持一条消息包含多个 URL，逐个导入并汇总结果回复
- **event_id 去重**：防止飞书超时重试导致重复导入（内存 Set，上限 1000 条）
- **异步处理**：先返回 200 给飞书，再后台执行导入和回复，避免 3 秒超时触发重试
- 可选 `LARK_ALLOWED_USER_IDS` 限制可触发导入的用户

### Environment Variables
- `.env.example` 新增：`QUICK_IMPORT_API_KEY`、`LARK_APP_ID`、`LARK_APP_SECRET`、`LARK_VERIFICATION_TOKEN`、`LARK_ALLOWED_USER_IDS`
- `docker-compose.dev.yml` 新增对应环境变量配置
- `docker-compose.dev.yml` 新增 `NODE_TLS_REJECT_UNAUTHORIZED=0`（开发环境解决容器内 HTTPS 证书问题）
- `Dockerfile.dev` 新增 `ca-certificates` 安装

### Bug Fix
- 飞书 webhook 超时重试导致重复导入：通过 event_id 去重 + 异步处理双重保障解决

## Files Created

- `src/lib/lark.ts`
- `src/app/api/lark-webhook/route.ts`

## Files Modified

- `.env.example`
- `docker-compose.dev.yml`
- `Dockerfile.dev`

## Development Testing Notes

### ngrok 内网穿透（仅开发测试用）

飞书事件订阅要求公网可访问的 HTTPS 地址，本地开发使用 ngrok 进行内网穿透：

```bash
# 安装
brew install ngrok

# 配置 authtoken（从 https://dashboard.ngrok.com 获取）
ngrok config add-authtoken YOUR_TOKEN

# 启动（如果本机有代理需清除 HTTPS_PROXY）
HTTPS_PROXY= ngrok http 3000
```

- ngrok 免费版每次启动地址会变，需要同步更新飞书事件订阅的请求地址
- 本次测试地址：`https://unraisable-hal-deludingly.ngrok-free.dev`

### 飞书应用配置步骤

1. [飞书开放平台](https://open.feishu.cn/app) 创建企业自建应用
2. 添加应用能力 → 开启「机器人」
3. 权限管理 → 开通 `im:message`、`im:message:send_as_bot`、`im:message.p2p_msg:readonly`（私聊消息必须）
4. 事件与回调 → 事件订阅 → 填写请求地址 → 添加 `im.message.receive_v1` 事件
5. 版本管理与发布 → 创建版本 → 发布并审批

### 生产部署注意事项

1. **请求地址需更新**：部署到服务器后，飞书事件订阅的请求地址需改为服务器公网地址，如 `https://your-domain.com/api/lark-webhook`
2. **移除 NODE_TLS_REJECT_UNAUTHORIZED**：生产环境应正确配置 SSL 证书，不应跳过证书验证
3. **QUICK_IMPORT_API_KEY**：需更换为强随机字符串，不要使用默认占位值
4. **LARK_ALLOWED_USER_IDS**：建议配置为管理员的 open_id，限制可触发导入的用户范围
5. **ngrok 不需要**：服务器本身有公网 IP/域名，无需内网穿透
