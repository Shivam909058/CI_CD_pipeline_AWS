#!/bin/bash
# EC2 Deployment Script

set -e

# Configuration
APP_DIR="/var/www/html/taskmanager"
BACKUP_DIR="/var/backups/taskmanager"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting deployment at $(date)"

# Create backup
sudo mkdir -p $BACKUP_DIR
if [ -d "$APP_DIR" ]; then
  sudo cp -r $APP_DIR $BACKUP_DIR/backup_$TIMESTAMP
  echo "✅ Backup created: $BACKUP_DIR/backup_$TIMESTAMP"
fi

# Create app directory
sudo mkdir -p $APP_DIR

# Copy new files
sudo cp -r /tmp/build/* $APP_DIR/

# Set permissions
sudo chown -R nginx:nginx $APP_DIR
sudo chmod -R 755 $APP_DIR

# Update version info
sudo sed -i 's/1\.0\.0/1.0.0-ec2-'$TIMESTAMP'/g' $APP_DIR/index.html

# Restart nginx
sudo systemctl restart nginx

echo "✅ Deployment completed successfully!"
echo "🌐 Application is available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/taskmanager/" 