# 管理后台脚手架 — 技术设计文档

> 项目代号：admin-app　|　版本：v0.1.0　|　状态：设计定稿

## 1. 项目概述

本项目为通用企业管理后台的基础脚手架，覆盖 **认证鉴权、用户管理、角色权限（RBAC）、菜单管理、操作日志、仪表盘统计** 六大模块，前后端分离，全栈容器化部署。

### 1.1 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 前端框架 | Vue 3 + TypeScript | Composition API |
| UI 库 | Element Plus | 中后台组件库 |
| 构建工具 | Vite | 开发/构建 |
| 状态管理 | Pinia | 用户态、权限态 |
| 路由 | Vue Router | 动态路由 + 权限守卫 |
| 请求库 | Axios | 统一封装、拦截器 |
| 图表 | ECharts | 仪表盘统计 |
| 后端框架 | NestJS (Node.js) | 模块化、依赖注入 |
| 数据库 | PostgreSQL | 主存储 |
| ORM | Prisma | 数据模型与迁移 |
| 缓存 | Redis | 会话/缓存 |
| 认证 | JWT + Passport | 无状态鉴权 |
| API 文档 | Swagger (OpenAPI) | 在线调试 |
| 部署 | Docker + Docker Compose | 容器化、镜像化 |

### 1.2 目录结构（Monorepo）

```
admin-app/
├── docs/                 # 设计文档
├── frontend/             # Vue3 前端
├── backend/              # NestJS 后端
└── docker-compose.yml    # 全栈编排
```

## 2. 系统架构

```
                    ┌──────────────────────────────┐
                    │        Browser (Vue3 SPA)     │
                    │   Element Plus / Pinia / ECharts │
                    └──────────────┬───────────────┘
                                   │ HTTPS / Axios (JWT)
                    ┌──────────────▼───────────────┐
                    │        Nginx (frontend)      │
                    └──────────────┬───────────────┘
                                   │ /api 反向代理
                    ┌──────────────▼───────────────┐
                    │       NestJS (backend)       │
                    │  Auth/User/Role/Menu/Log/Dash │
                    └───────┬───────────────┬──────┘
                            │               │
              ┌─────────────▼──┐      ┌─────▼───────────┐
              │   PostgreSQL   │      │     Redis       │
              │   (Prisma ORM) │      │  (缓存/会话)    │
              └────────────────┘      └─────────────────┘
```

## 3. 数据库设计（Prisma Schema）

### 3.1 ER 关系

- `User` 用户表，与 `Role` 多对多（通过 `UserRole`）
- `Role` 角色表，与 `Menu` 多对多（通过 `RoleMenu`）
- `Menu` 菜单表，自关联父子层级
- `OperationLog` 操作日志表，记录用户行为
- `DictType` / `DictItem` 数据字典（预留）

### 3.2 核心表结构

| 表 | 关键字段 | 说明 |
|----|---------|------|
| users | id, username, password(bcrypt), nickname, email, phone, avatar, status, is_super | 用户 |
| roles | id, name, code, description, status | 角色 |
| menus | id, parent_id, name, path, component, type(目录/菜单/按钮), icon, sort, status, perms | 菜单与权限点 |
| user_roles | user_id, role_id | 用户-角色关联 |
| role_menus | role_id, menu_id | 角色-菜单关联 |
| operation_logs | id, user_id, module, action, method, url, params, ip, status, cost_time, created_at | 操作日志 |
| dict_types / dict_items | 字典类型与项 | 数据字典（预留） |

## 4. 后端设计（NestJS）

### 4.1 模块划分

- `AppModule` — 根模块
- `PrismaModule` — 数据库连接（全局）
- `RedisModule` — 缓存（全局）
- `AuthModule` — 登录、注册、JWT、Passport 守卫
- `UserModule` — 用户 CRUD
- `RoleModule` — 角色 CRUD + 授权
- `MenuModule` — 菜单 CRUD + 权限点
- `LogModule` — 操作日志查询
- `DashboardModule` — 统计
- `CommonModule` — 过滤器、拦截器、装饰器、DTO

### 4.2 认证与鉴权

- **登录流程**：用户名密码 → bcrypt 校验 → 签发 JWT → 返回 token + 用户信息
- **鉴权**：`JwtAuthGuard` 全局守卫 + `RolesGuard` 角色权限校验
- **权限点**：菜单 `perms` 字段定义权限标识，如 `system:user:add`
- **Redis**：存储 token 黑名单/在线状态，实现登出失效

### 4.3 API 设计（前缀 `/api/v1`）

| 模块 | 方法 & 路径 | 说明 |
|------|-----------|------|
| Auth | POST /auth/login | 登录 |
| Auth | GET /auth/profile | 当前用户信息+权限 |
| Auth | POST /auth/logout | 登出 |
| User | GET/POST /user | 用户列表/新增 |
| User | PUT/DELETE /user/:id | 编辑/删除 |
| Role | GET/POST /role | 角色列表/新增 |
| Role | PUT /role/:id | 编辑角色 |
| Role | PUT /role/:id/menus | 角色分配菜单 |
| Menu | GET/POST /menu | 菜单树/新增 |
| Menu | PUT/DELETE /menu/:id | 编辑/删除 |
| Log | GET /log | 操作日志分页 |
| Dashboard | GET /dashboard/stats | 统计卡片 |
| Dashboard | GET /dashboard/trend | 趋势图 |

### 4.4 统一响应格式

```json
{ "code": 0, "message": "ok", "data": { ... } }
```

## 5. 前端设计（Vue3）

### 5.1 页面与路由

| 路由 | 页面 | 说明 |
|------|------|------|
| /login | Login | 登录页 |
| /dashboard | Dashboard | 仪表盘（ECharts） |
| /system/user | SystemUser | 用户管理 |
| /system/role | SystemRole | 角色管理 |
| /system/menu | SystemMenu | 菜单管理 |
| /system/log | SystemLog | 操作日志 |
| /profile | Profile | 个人中心 |

### 5.2 状态与守卫

- **Pinia**：`userStore`（token/用户信息/权限）、`appStore`（侧栏/标签页）
- **路由守卫**：无 token 跳登录；动态加载菜单路由
- **权限指令**：`v-perm` 自定义指令控制按钮显隐

### 5.3 请求封装

- Axios 拦截器：请求带 `Authorization`、响应统一解包、401 跳登录、错误 ElMessage 提示

## 6. 容器化部署

| 服务 | 镜像 | 端口 | 说明 |
|------|------|------|------|
| frontend | admin-frontend | 80 | Nginx + 构建产物，反代 /api |
| backend | admin-backend | 3000 | NestJS 生产构建 |
| postgres | postgres:16-alpine | 5432 | 数据库 |
| redis | redis:7-alpine | 6379 | 缓存 |

## 7. 开发里程碑

1. ✅ 设计文档
2. ⬜ 后端脚手架 + 数据模型 + 认证 + 各模块
3. ⬜ 前端脚手架 + 布局 + 各页面
4. ⬜ Docker 镜像 + compose 编排
5. ⬜ README + 交付
