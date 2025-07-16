#!/bin/bash
# EC2 User Data Script for Task Manager App

# Update system
yum update -y

# Install nginx
yum install -y nginx

# Start and enable nginx
systemctl start nginx
systemctl enable nginx

# Create application directory
mkdir -p /var/www/html/taskmanager

# Set permissions
chown -R nginx:nginx /var/www/html
chmod -R 755 /var/www/html

# Configure nginx
cat > /etc/nginx/conf.d/taskmanager.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/html/taskmanager;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Restart nginx
systemctl restart nginx

# Create deployment user
useradd -m deploy
usermod -aG wheel deploy

# Setup SSH for deployment
mkdir -p /home/deploy/.ssh
chown deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

echo "✅ EC2 setup completed!" 