#!/bin/bash

# 启用错误追踪
set -e

echo "### 检查证书是否存在 ..."
docker compose run --rm --entrypoint "\
  ls -la /etc/letsencrypt/live/lighter.xuhua.fun/" certbot || {
  echo "错误: SSL 证书不存在，请先成功运行 init-letsencrypt.sh"
  exit 1
}

# 检查证书内容
echo "### 检查证书内容 ..."
docker compose run --rm --entrypoint "\
  openssl x509 -in /etc/letsencrypt/live/lighter.xuhua.fun/fullchain.pem -text -noout | grep -E 'Subject:|DNS:'" certbot

echo "### 恢复 HTTPS 配置 ..."
cat > ./nginx/conf/app.conf << 'EOF'
server {
    listen 80;
    server_name lighter.xuhua.fun;

    # 用于 Let's Encrypt 验证
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
        try_files $uri =404;
    }

    # 其他所有请求重定向到 HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name lighter.xuhua.fun;

    # SSL 证书配置 - 使用正确的路径 lighter.xuhua.fun
    ssl_certificate /etc/letsencrypt/live/lighter.xuhua.fun/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lighter.xuhua.fun/privkey.pem;

    # SSL 参数
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozSSL:10m;
    ssl_session_tickets off;

    # 现代兼容性推荐的 SSL 参数
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 安全头部设置
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";

    # 代理设置
    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        proxy_redirect off;
        proxy_read_timeout 120s;
    }
}
EOF

echo "### 重启服务 ..."
docker compose down
docker compose up -d

echo "### 检查服务状态 ..."
docker compose ps

echo "### 验证 Nginx 配置 ..."
docker compose exec nginx nginx -T

echo "HTTPS 已启用！"
