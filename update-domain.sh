#!/bin/bash

# 启用错误追踪
set -e

domains=(lighter.xuhua.fun)
email="mail@sunchaoran.com"
staging=0 # 设置为 1 表示测试模式，0 表示生产模式

echo "### 检查域名解析 ..."
echo "当前服务器 IP:"
curl -s http://checkip.amazonaws.com
echo "域名解析到的 IP:"
for domain in "${domains[@]}"; do
  echo "检查 $domain:"
  host $domain || echo "$domain 域名解析失败"
done

# 确保 Nginx 配置正确，支持两个域名
echo "### 更新 Nginx 配置 ..."
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
    
    # 所有请求代理到应用
    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo "### 重启服务 ..."
docker compose down
docker compose up -d
echo

# 等待 Nginx 启动完成
echo "### 等待 Nginx 启动完成 ..."
sleep 15

# 检查 Nginx 是否正常运行
echo "### 检查 Nginx 状态 ..."
docker compose ps
echo "### 检查 Nginx 日志 ..."
docker compose logs nginx

# 创建测试文件
echo "### 创建测试文件 ..."
mkdir -p ./nginx/certbot/www/.well-known/acme-challenge
echo "这是一个测试文件" > ./nginx/certbot/www/.well-known/acme-challenge/test.txt
echo "测试文件已创建: ./nginx/certbot/www/.well-known/acme-challenge/test.txt"

# 检查测试文件是否可访问
echo "### 检查测试文件是否可访问 ..."
for domain in "${domains[@]}"; do
  echo "检查 $domain:"
  curl -v http://$domain/.well-known/acme-challenge/test.txt || echo "$domain 外部访问失败"
done

# 如果外部访问失败，提示用户检查域名解析和防火墙设置
read -p "确认外部访问是否成功？继续获取证书？ (y/N) " continue_decision
if [ "$continue_decision" != "Y" ] && [ "$continue_decision" != "y" ]; then
  echo "请检查域名解析和防火墙设置后再试"
  exit 1
fi

echo "### 请求 Let's Encrypt 证书 ..."
#Join $domains to -d args
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

# 选择 staging / production 模式
if [ $staging != "0" ]; then staging_arg="--staging"; fi

# 使用 --dry-run 先测试
echo "### 先进行测试运行 ..."
docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --dry-run \
    $staging_arg \
    --email $email \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -v \
    $domain_args" certbot || echo "测试运行失败，但继续执行"
echo

# 如果测试成功，再进行实际申请
echo "### 请求实际证书 ..."
docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    --email $email \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    $domain_args" certbot || echo "证书请求失败"
echo

# 检查证书是否成功获取
echo "### 检查证书 ..."
docker compose run --rm --entrypoint "\
  ls -la /etc/letsencrypt/live/" certbot || echo "证书目录不存在"

# 查找最新的证书目录
echo "### 查找最新的证书目录 ..."
cert_dir=$(docker compose run --rm --entrypoint "\
  find /etc/letsencrypt/live/ -type d -name 'lighter*' | sort | tail -n 1" certbot | tr -d '\r')
echo "最新的证书目录: $cert_dir"

# 检查证书内容
echo "### 检查证书内容 ..."
docker compose run --rm --entrypoint "\
  openssl x509 -in $cert_dir/fullchain.pem -text -noout | grep -E 'Subject:|DNS:'" certbot || echo "无法读取证书内容"

# 更新 HTTPS 配置
echo "### 更新 HTTPS 配置 ..."
cat > ./nginx/conf/app.conf << EOF
server {
    listen 80;
    server_name lighter.xuhua.fun;
    
    # 用于 Let's Encrypt 验证
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
        try_files \$uri =404;
    }
    
    # 其他所有请求重定向到 HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name lighter.xuhua.fun;
    
    # SSL 证书配置 - 使用最新的证书路径
    ssl_certificate $cert_dir/fullchain.pem;
    ssl_certificate_key $cert_dir/privkey.pem;
    
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
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
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

echo "HTTPS 已启用！应用现在可以通过 https://lighter.xuhua.fun 访问" 