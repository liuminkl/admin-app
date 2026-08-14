# Admin App 管理后台脚手架

通用企业管理后台基础脚手架，前后端分离，全栈容器化部署。

## ✨ 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Vue 3 + TypeScript + Element Plus + Vite |
| 状态管理 | Pinia |
| 路由 | Vue Router（动态路由 + 权限守卫） |
| 请求 | Axios（统一拦截器封装） |
| 图表 | ECharts |
| 后端 | NestJS（Node.js） |
| 数据库 | PostgreSQL + Prisma ORM |
| 缓存 | Redis |
| 认证 | JWT + Passport |
| API 文档 | Swagger（OpenAPI） |
| 部署 | Docker + Docker Compose |

## 📁 目录结构

```
admin-app/
├── docs/
│   └── DESIGN.md          # 技术设计文档
├── frontend/              # Vue3 前端
│   ├── src/
│   │   ├── api/           # 接口封装
│   │   ├── layout/        # 布局（侧边栏、顶栏）
│   │   ├── router/        # 路由与守卫
│   │   ├── stores/        # Pinia 状态
│   │   ├── views/         # 页面
│   │   │   ├── login/     # 登录
│   │   │   ├── dashboard/ # 仪表盘
│   │   │   └── system/    # 系统管理（用户/角色/菜单/日志）
│   │   └── utils/         # 工具（axios 封装）
│   ├── Dockerfile         # Nginx 镜像
│   └── nginx.conf
├── backend/               # NestJS 后端
│   ├── prisma/
│   │   ├── schema.prisma  # 数据模型
│   │   └── seed.ts        # 种子数据
│   └── src/
│       ├── auth/          # 认证模块
│       ├── user/          # 用户模块
│       ├── role/          # 角色模块
│       ├── menu/          # 菜单模块
│       ├── log/           # 操作日志模块
│       ├── dashboard/     # 仪表盘模块
│       └── common/        # 公共（拦截器/守卫/装饰器）
├── Dockerfile（后端）
└── docker-compose.yml     # 全栈编排
```

## 🚀 快速开始

### 方式一：Docker Compose 一键部署（推荐）

```bash
# 构建并启动全部服务（前端+后端+PostgreSQL+Redis）
docker compose up -d --build

# 查看状态
docker compose ps
```

部署完成后访问：

| 服务 | 地址 |
|------|------|
| 管理后台 | http://localhost |
| 后端 API | http://localhost:3000 |
| Swagger 文档 | http://localhost:3000/api-docs |

**默认账号**：`admin` / `admin123`

### 方式二：本地开发

> **容器运行时**：本地开发环境使用 [Colima](https://github.com/abiosoft/colima)（macOS 轻量容器运行时，无需 Docker Desktop）。首次使用需安装并启动：
>
> ```bash
> brew install colima docker docker-compose
> colima start                # 启动 colima 虚拟机
> docker context use colima   # 将 Docker CLI 指向 colima
> ```
>
> 之后所有 `docker` / `docker compose` 命令均经由 colima 执行。

#### 前置依赖
- Node.js 18+
- Colima（启动并运行中的容器运行时）
- PostgreSQL 14+（可通过下方 docker compose 提供，无需本机安装）
- Redis 6+（可通过下方 docker compose 提供，无需本机安装）

#### 1. 启动数据库（经 colima 运行）
```bash
# 本地无需自行安装 PostgreSQL 和 Redis，直接经 colima 启动：
docker compose up -d postgres redis
```

#### 2. 启动后端
```bash
cd backend
cp .env.example .env        # 配置数据库连接
npm install
npx prisma generate
npx prisma db push          # 同步数据库结构
npm run prisma:seed         # 初始化种子数据
npm run start:dev           # 启动开发服务（http://localhost:3000）
```

#### 3. 启动前端
```bash
cd frontend
npm install
npm run dev                 # 启动开发服务（http://localhost:5173）
```

## 🧩 功能模块

- **认证登录**：JWT 无状态认证、登出、修改密码
- **用户管理**：用户 CRUD、角色分配、状态启禁用、重置密码
- **角色管理**：角色 CRUD、菜单权限分配（RBAC）
- **菜单管理**：目录/菜单/按钮三级管理、权限标识配置
- **操作日志**：自动记录接口操作日志、按模块/用户/状态查询
- **仪表盘**：统计卡片、用户趋势图、日志分布图

## 🔐 权限体系（RBAC）

- **用户-角色-菜单** 三层关联
- 菜单的 `perms` 字段定义权限标识（如 `system:user:add`）
- 前端通过 `v-perm` 指令控制按钮显隐
- 后端通过 `@RequirePermission()` 装饰器校验接口权限
- 超级管理员拥有全部权限

## 🐳 构建镜像

```bash
# 前端镜像
cd frontend && docker build -t admin-frontend:latest .

# 后端镜像
cd backend && docker build -t admin-backend:latest .
```

## 📄 API 文档

启动后访问 `http://localhost:3000/api-docs` 查看 Swagger 在线接口文档，支持在线调试（点击右上角 `Authorize` 填入登录返回的 token）。

## 🔒 安全说明

- 生产环境请务必修改 `.env` / `docker-compose.yml` 中的：
  - `JWT_SECRET` 密钥
  - 数据库 `POSTGRES_PASSWORD`
- 建议生产环境关闭 Swagger 或加入访问控制
