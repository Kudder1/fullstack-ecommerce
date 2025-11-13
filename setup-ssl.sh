#!/bin/bash

# Generate SSL certificates with Let's Encrypt
# Run this script after setting up your domain name

# Make sure you've set your domain in .env file
source .env

if [ -z "$DOMAIN" ]; then
    echo "Error: DOMAIN is not set in .env file"
    exit 1
fi

echo "Generating SSL certificate for $DOMAIN..."

# Create necessary directories
mkdir -p certbot/conf
mkdir -p certbot/www

# Stop nginx if running
docker-compose stop nginx

# Get certificate
docker-compose run --rm certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email $AWS_SES_SENDER \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

# Update nginx configuration to use SSL
cp nginx/nginx-ssl.conf nginx/nginx.conf
sed -i "s|\\\${DOMAIN}|$DOMAIN|g" nginx/nginx.conf

# Verify the replacement worked
echo "Verifying domain replacement..."
grep "server_name" nginx/nginx.conf | head -2

# Restart nginx
docker-compose up -d nginx

echo "SSL certificate generated successfully!"
echo "Your site is now accessible at https://$DOMAIN"
