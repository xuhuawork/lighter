#!/bin/bash

# 启用错误追踪
set -e

if ! [ -x "$(command -v docker)" ]; then
  echo '错误: docker 未安装.' >&2
  exit 1
fi

domains=(lighter.xuhua.fun)
rsa_key_size=4096
data_path="./nginx/certbot"
email="mail@sunchaoran.com"
staging=0 # 设置为 1 表示测试模式，0 表示生产模式

# 检查域名解析
echo "### 检查域名解析 ..."
echo "当前服务器 IP:"
curl -s http://checkip.amazonaws.com || echo "无法获取公网 IP"
echo "域名解析到的 IP:"
host lighter.xuhua.fun || echo "域名解析失败"

if [ -d "$data_path" ]; then
  read -p "现有数据将被覆盖。继续？ (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi

# 确保目录存在
mkdir -p "$data_path/conf"
mkdir -p "$data_path/www/.well-known/acme-challenge"

# 下载 SSL 配置文件
echo "### 下载推荐的 TLS 参数 ..."
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
echo

# 创建测试文件
echo "### 创建测试文件 ..."
echo "这是一个测试文件" > "$data_path/www/.well-known/acme-challenge/test.txt"
echo "测试文件已创建: $data_path/www/.well-known/acme-challenge/test.txt"

# 确保 Nginx 配置不包含 SSL 引用
echo "### 确保 Nginx 配置不包含 SSL 引用 ..."
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

echo "### 重启 nginx ..."
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

# 检查测试文件是否可访问
echo "### 检查测试文件是否可访问 ..."
curl -v http://localhost/.well-known/acme-challenge/test.txt
echo "### 检查外部访问 ..."
curl -v http://lighter.xuhua.fun/.well-known/acme-challenge/test.txt || echo "外部访问失败"

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
    $domain_args" certbot || echo "证书请求失败"
echo

# 检查证书是否成功获取
echo "### 检查证书 ..."
docker compose run --rm --entrypoint "\
  ls -la /etc/letsencrypt/live/$domains" certbot || echo "证书不存在"

echo "初始化完成！"

# 提示下一步操作
echo "
如果证书获取成功，请运行 './enable-https.sh' 启用 HTTPS。
"
