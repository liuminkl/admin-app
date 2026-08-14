# ========== 后端构建阶段 ==========
FROM node:22-alpine AS builder

WORKDIR /app

# 安装构建依赖
COPY package*.json ./
RUN npm ci --registry=https://mirrors.tencent.com/npm/

# 复制 Prisma schema 并生成 client
COPY prisma ./prisma
RUN npx prisma generate

# 复制源码并构建
COPY . .
RUN npm run build
# 编译 seed 脚本为 JS（供生产环境 node 直接运行）
RUN npx tsc prisma/seed.ts --outDir dist-seed --module commonjs --esModuleInterop --skipLibCheck --target es2020

# ========== 生产运行阶段 ==========
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# 复制 package 文件
COPY package*.json ./
RUN npm ci --omit=dev --registry=https://mirrors.tencent.com/npm/

# 复制 Prisma schema 和 client
COPY prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-seed ./dist-seed

# 暴露端口
EXPOSE 3000

# 启动命令：先同步数据库结构再启动
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/src/main"]
