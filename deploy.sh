#!/bin/bash

# 颜色设置，使输出更易读
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 服务器配置
SERVER_IP="39.101.76.177"
SSH_KEY="/Users/scoheart/.ssh/id_ed25519"
SERVER_USER="root" # 默认使用root用户，如需更改请修改此处
PORT="8888"
REMOTE_DIR="/var/www/wakatime-dashboard"

# 本地项目路径，默认为当前目录
LOCAL_PROJECT_DIR="."

echo -e "${BLUE}===== WakaTime Dashboard 部署脚本 =====${NC}"
echo -e "${BLUE}将部署到服务器: ${SERVER_IP}:${PORT}${NC}"

# 1. 构建项目
echo -e "${BLUE}[1/5] 构建项目...${NC}"
cd "$LOCAL_PROJECT_DIR"
npm install
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}构建失败，退出部署${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 构建成功${NC}"

# 2. 创建部署目录
echo -e "${BLUE}[2/5] 创建远程部署目录...${NC}"
ssh -i "$SSH_KEY" "${SERVER_USER}@${SERVER_IP}" "mkdir -p ${REMOTE_DIR}"
if [ $? -ne 0 ]; then
    echo -e "${RED}创建远程目录失败，请检查您的SSH密钥和服务器配置${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 远程目录已准备${NC}"

# 3. 传输文件到服务器
echo -e "${BLUE}[3/5] 传输文件到服务器...${NC}"
scp -i "$SSH_KEY" -r "$LOCAL_PROJECT_DIR/dist/"* "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/"
if [ $? -ne 0 ]; then
    echo -e "${RED}文件传输失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 文件传输成功${NC}"

# 4. 在服务器上安装和配置 Nginx
echo -e "${BLUE}[4/5] 检查并安装 Nginx...${NC}"
ssh -i "$SSH_KEY" "${SERVER_USER}@${SERVER_IP}" << 'EOF'
# 检查Nginx是否已经安装
if ! command -v nginx &> /dev/null; then
    echo "Nginx未安装，开始安装..."
    
    # 检查包管理器并安装Nginx
    if command -v apt-get &> /dev/null; then
        # Debian/Ubuntu
        apt-get update
        apt-get install -y nginx
    elif command -v yum &> /dev/null; then
        # CentOS/RHEL
        yum install -y epel-release
        yum install -y nginx
    else
        echo "无法确定包管理器，请手动安装Nginx"
        exit 1
    fi
    
    echo "Nginx安装完成"
else
    echo "Nginx已安装"
fi

# 创建Nginx配置文件
cat > /etc/nginx/conf.d/wakatime-dashboard.conf << CONFEND
server {
    listen 8888;
    server_name _;
    
    root /var/www/wakatime-dashboard;
    index index.html;
    
    # 配置Vite的API代理
    location /api/wakatime/ {
        proxy_pass https://wakatime.com/api/v1/;
        proxy_set_header Host wakatime.com;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # 提供静态文件
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
CONFEND

# 测试Nginx配置是否有效
nginx -t

# 设置防火墙允许8888端口(如果有)
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-port=8888/tcp
    firewall-cmd --reload
    echo "防火墙已配置"
elif command -v ufw &> /dev/null; then
    ufw allow 8888/tcp
    echo "UFW防火墙已配置"
fi

# 确保Nginx服务在系统启动时自动启动
if command -v systemctl &> /dev/null; then
    systemctl enable nginx
fi

EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}Nginx配置失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Nginx配置成功${NC}"

# 5. 重启Nginx服务
echo -e "${BLUE}[5/5] 重启Nginx服务...${NC}"
ssh -i "$SSH_KEY" "${SERVER_USER}@${SERVER_IP}" "systemctl restart nginx || service nginx restart"
if [ $? -ne 0 ]; then
    echo -e "${RED}Nginx重启失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Nginx已重启${NC}"

echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}🎉 部署成功!${NC}"
echo -e "${GREEN}您的WakaTime Dashboard现在可以通过以下地址访问:${NC}"
echo -e "${BLUE}http://${SERVER_IP}:${PORT}${NC}"
echo -e "${GREEN}=======================================${NC}" 