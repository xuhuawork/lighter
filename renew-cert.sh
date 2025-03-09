#!/bin/bash

# 启用错误追踪
set -e

domains=(lighter.xuhua.fun)
email="mail@sunchaoran.com"
staging=0 # 设置为 1 表示测试模式，0 表示生产模式

echo "### 清除现有证书 ..."
docker compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$domains && \
  rm -Rf /etc/letsencrypt/archive/$domains && \
  rm -Rf /etc/letsencrypt/renewal/$domains.conf" certbot || echo "无证书可清除"

echo "### 检查域名解析 ..."
echo "当前服务器 IP:"
curl -s http://checkip.amazonaws.com
echo "域名解析到的 IP:"
host lighter.xuhua.fun || echo "域名解析失败"

# 确保 Nginx 配置正确
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
curl -v http://localhost/.well-known/acme-challenge/test.txt
echo "### 检查外部访问 ..."
curl -v http://lighter.xuhua.fun/.well-known/acme-challenge/test.txt || echo "外部访问失败"

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
  ls -la /etc/letsencrypt/live/$domains" certbot || echo "证书不存在"

# 检查证书内容
echo "### 检查证书内容 ..."
docker compose run --rm --entrypoint "\
  openssl x509 -in /etc/letsencrypt/live/lighter.xuhua.fun/fullchain.pem -text -noout | grep -E 'Subject:|DNS:'" certbot || echo "无法读取证书内容"

echo "证书更新完成！"

# 提示下一步操作
echo "
如果证书获取成功，请运行 './enable-https.sh' 启用 HTTPS。
"
