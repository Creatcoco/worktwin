# WorkTwin · 你的工作分身（P1 MVP）

把你的专业技能**镜像成一名工作分身**——它 7×24 在岗替你接单赚钱。一键接入 OpenClaw / Hermes / Cursor / Claude。

> 这是 P1 MVP，使用内存 mock 数据层，重启后数据重置。

## 快速开始

```bash
cd web
npm install
npm run dev
```

打开 http://localhost:3000

默认登录用户：`demo@worktwin.cn`（mock，无需密码）

## 技术栈

- **Next.js 16** App Router
- **TypeScript** 严格类型
- **Tailwind CSS v4** 深色 AI 科技风
- **内存 mock 数据层**（`lib/store.ts`）

## 项目结构

```
web/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx            # 落地页（Hero + 功能 + 双轨架构）
│   ├── market/             # M3 雇佣市场 + 员工详情
│   ├── integrate/          # M1 一键接入中心（5 步状态机）
│   ├── studio/             # M2 数字员工工坊
│   ├── dashboard/          # M4 雇佣关系管理
│   ├── dispatch/           # M5 任务派发中心
│   ├── settlement/         # M6 结算中心
│   ├── developer/          # M7 开发者中心
│   ├── assessment/         # 智能天赋测评
│   └── docs/               # 开发者文档
├── components/             # Nav / Footer / EmployeeCard / PageHeader
├── lib/store.ts            # 内存 mock 数据层 + 种子数据
└── types/index.ts          # 核心类型定义

docs/                       # 产品与设计文档
├── 开发者文档.md
├── 产品方案.md
└── M1-一键接入中心-详细设计.md
```

## 9 大功能模块

| 模块 | 路径 | 说明 |
| --- | --- | --- |
| M1 一键接入中心 | `/integrate` | 5 步状态机：选平台→鉴权→发现→组装→上架 |
| M2 数字员工工坊 | `/studio` | 把能力人格化为可雇佣员工 |
| M3 雇佣市场 | `/market` | 搜索/筛选/查看简历/一键雇佣 |
| M4 雇佣管理 | `/dashboard` | 在职员工、合同、任务进度 |
| M5 任务派发 | `/dispatch` | 自然语言派单 + 状态推进 |
| M6 结算中心 | `/settlement` | CNY/UT 双钱包 + 流水对账 |
| M7 开发者中心 | `/developer` | API Key + Agent Card + 端点速览 |
| M8 身份匹配 | （lib 内部） | 双轨认证与撮合逻辑 |
| M9 信任治理 | （P3） | 信用分、评价、争议仲裁 |

## 双轨架构（对齐开发者文档）

| | 人类路径 | Agent 路径 |
| --- | --- | --- |
| 供给 | Skill 技能 | Capability 能力 |
| 需求 | Task 任务 | Demand 需求 |
| 成交 | Order 订单 | Transaction 交易 |
| 结算 | CNY | UT |
| 认证 | Bearer JWT | X-Api-Key |

## 演示流程

1. 访问 `/` 首页，了解平台
2. 进入 `/assessment` 做天赋测评
3. 进入 `/integrate` 一键接入你的 Agent（OpenClaw 扫码 → 发现能力 → 生成员工）
4. 进入 `/market` 浏览数字员工，查看简历，一键雇佣
5. 进入 `/dispatch` 给在职员工派单，推进任务状态
6. 进入 `/settlement` 查看双钱包余额与流水对账
7. 进入 `/developer` 查看 API Key 与 Agent Card

## 部署上线

将 WorkTwin 部署到阿里云 ECS，访问 `https://worktwin.cn` 正常打开。

### 整体架构

```
浏览器 https://worktwin.cn
        ↓
   阿里云 DNS（A 记录 → ECS 公网 IP）
        ↓
   Nginx :443（HTTPS / Let's Encrypt 证书）
        ↓
   Next.js :3000（PM2 守护）
```

### 前置条件

| 条件 | 说明 |
| --- | --- |
| 阿里云 ECS | Ubuntu Server 22.04 LTS，2 核 2G 起步 |
| 域名 `worktwin.cn` | 已在阿里云购买 |
| **ICP 备案** | **.cn 域名必须备案**，否则阿里云会拦截访问；流程 7-20 个工作日，建议最先发起 |
| 公网 IP | 例 `47.96.xx.xx` |

> 备案未通过前，DNS 解析即使配好也会被拦截到提示页。备案期间可在 ECS 上先用 IP 跑通部署链路，备案下来后切换域名访问。

### 1. DNS 解析

阿里云「云解析 DNS」→ 添加记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
| --- | --- | --- | --- |
| A | `@` | `47.96.xx.xx` | 10 分钟 |
| A | `www` | `47.96.xx.xx` | 10 分钟 |
| A | `api` | `47.96.xx.xx` | 10 分钟 |

生效后本地 `ping worktwin.cn` 能通 ECS IP 即可。

### 2. 安全组放行端口

ECS → 安全组 → 入方向：

| 端口 | 授权对象 | 用途 |
| --- | --- | --- |
| 22 | `你的IP/32` | SSH（限制来源更安全） |
| 80 | `0.0.0.0/0` | HTTP（证书申请 + 跳转 HTTPS） |
| 443 | `0.0.0.0/0` | HTTPS |
| 3000 | `127.0.0.1/32` | Next.js，**仅本机**，不对公网开放 |

### 3. 上传代码

```bash
# 本地：打包（排除 node_modules / .next）
cd /Users/lxy/Desktop/ai/uumit
tar --exclude='web/node_modules' --exclude='web/.next' -czf worktwin.tar.gz .

# 上传
scp worktwin.tar.gz root@47.96.xx.xx:/opt/

# 服务器：解压
ssh root@47.96.xx.xx
mkdir -p /opt/worktwin && tar -xzf /opt/worktwin.tar.gz -C /opt/worktwin
cd /opt/worktwin/web
```

> 若代码托管在 GitHub/Gitee，服务器直接 `git clone` 更省事。

### 4. 安装运行环境

```bash
apt update && apt upgrade -y

# Node.js 20 LTS（Next.js 16 要求 Node >= 18.18）
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 进程守护 + 反向代理 + 证书
npm install -g pm2 --registry=https://registry.npmmirror.com
apt install -y nginx sqlite3 certbot python3-certbot-nginx
```

### 5. 构建项目

```bash
cd /opt/worktwin/web
npm install --registry=https://registry.npmmirror.com
npm run build     # 产物在 .next/
```

### 6. PM2 守护进程

```bash
pm2 start "npm run start" --name worktwin
pm2 save
pm2 startup systemd    # 按提示执行返回的命令，开机自启

# 常用：pm2 status / pm2 logs worktwin / pm2 restart worktwin
```

### 7. Nginx 反向代理

新建 `/etc/nginx/conf.d/worktwin.conf`：

```nginx
# HTTP -> HTTPS
server {
    listen 80;
    server_name worktwin.cn www.worktwin.cn api.worktwin.cn;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 301 https://$host$request_uri; }
}

# HTTPS 主站 + API（同一 Next.js 实例）
server {
    listen 443 ssl;
    http2 on;
    server_name worktwin.cn www.worktwin.cn api.worktwin.cn;

    # 证书路径：第 8 步 certbot 会自动填入
    # ssl_certificate     /etc/letsencrypt/live/worktwin.cn/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/worktwin.cn/privkey.pem;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
nginx -t && systemctl reload nginx
```

### 8. 申请 HTTPS 证书（Let's Encrypt）

```bash
certbot --nginx -d worktwin.cn -d www.worktwin.cn -d api.worktwin.cn \
  --email you@example.com --agree-tos --no-eff-email
```

Certbot 自动验证域名、填好证书路径、配置定时续期。完成后 `https://worktwin.cn` 可正常访问。

### 9. 验证

```bash
curl -I https://worktwin.cn        # 期望 200 / 307
```

浏览器打开 `https://worktwin.cn` 与 `/market`、`/integrate` 等页面确认渲染正常。

### 一键部署脚本

把上面步骤合并为 `deploy.sh`（**首次部署**一次跑完，变量按实际修改）：

```bash
#!/bin/bash
set -e

PROJECT_DIR="/opt/worktwin/web"
DOMAIN="worktwin.cn"
EMAIL="you@example.com"

apt update
apt install -y nginx git sqlite3 certbot python3-certbot-nginx curl
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2 --registry=https://registry.npmmirror.com

cd "$PROJECT_DIR"
npm install --registry=https://registry.npmmirror.com
npm run build

pm2 delete worktwin 2>/dev/null || true
pm2 start "npm run start" --name worktwin
pm2 save
pm2 startup systemd -y

cat > /etc/nginx/conf.d/worktwin.conf <<'EOF'
server {
    listen 80;
    server_name worktwin.cn www.worktwin.cn api.worktwin.cn;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 301 https://$host$request_uri; }
}
server {
    listen 443 ssl;
    http2 on;
    server_name worktwin.cn www.worktwin.cn api.worktwin.cn;
    client_max_body_size 20M;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
nginx -t && systemctl reload nginx

certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" -d "api.$DOMAIN" \
  --email "$EMAIL" --agree-tos --no-eff-email

echo "==> 完成，访问 https://$DOMAIN"
```

### 常见问题

| 现象 | 原因 | 解决 |
| --- | --- | --- |
| 显示阿里云拦截页 | 未备案 | 阿里云备案系统提交备案 |
| ping 不通 IP | 安全组未放行 | 控制台加 22/80/443 规则 |
| HTTPS 打不开，HTTP 能开 | 证书未申请成功 | 重跑 `certbot --nginx` 看报错 |
| 502 Bad Gateway | Next.js 未启动 | `pm2 logs worktwin` 排查 |
| 重启后网站挂掉 | PM2 未设开机自启 | `pm2 startup` 重新执行 |
| 偶发卡顿/OOM | 2G 内存吃紧 | `pm2 monit` 看内存，必要时加 swap |

### 后续运维

- **更新代码**：`cd /opt/worktwin && git pull && cd web && npm run build && pm2 restart worktwin`
- **查看日志**：`pm2 logs worktwin` / `tail -f /var/log/nginx/access.log`
- **证书续期**：Certbot 已自动配置 cron，手动验证 `certbot renew --dry-run`
- **内存升级**：流量起来后升级 ECS 到 4G，或加 RDS MySQL 拆分数据库

## 设计文档

- [`docs/产品方案.md`](docs/产品方案.md) — 完整产品方案（愿景、抽象、9 模块、数据模型、三期路线）
- [`docs/开发者文档.md`](docs/开发者文档.md) — 平台协议与术语
- [`docs/M1-一键接入中心-详细设计.md`](docs/M1-一键接入中心-详细设计.md) — 状态机与接口契约

## 后续路线

- **P2 协议化**：真 Device Auth、OpenClaw/Hermes/Cursor adapter、Agent 互雇
- **P3 生态化**：信用分、争议仲裁、分账提现、SQLite 持久化
