# ========== 前端构建阶段 ==========
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --registry=https://mirrors.tencent.com/npm/

COPY . .
RUN npm run build

# ========== Nginx 运行阶段 ==========
FROM nginx:1.27-alpine

# 拷贝构建产物到 nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 拷贝 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
