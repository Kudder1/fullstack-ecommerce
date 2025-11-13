#!/bin/bash

# Generate SSL certificates with Let's Encrypt
# Run this script after setting up your domain name

# Make sure you've set your domain in .env file
source .env

if [ -z "$DOMAIN" ]; then
    echo "Error: DOMAIN is not set in .env file"
    exit 1
fi

# Strip https:// or http:// from DOMAIN if present
CLEAN_DOMAIN="${DOMAIN#https://}"
CLEAN_DOMAIN="${CLEAN_DOMAIN#http://}"

echo "Original DOMAIN: $DOMAIN"
echo "Clean domain: $CLEAN_DOMAIN"
echo ""
echo "Generating SSL certificate for $CLEAN_DOMAIN..."

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
    -d $CLEAN_DOMAIN \
    -d www.$CLEAN_DOMAIN

# Update nginx configuration to use SSL
echo "Copying nginx-ssl.conf to nginx.conf..."
cp nginx/nginx-ssl.conf nginx/nginx.conf

# Replace ${DOMAIN} with actual domain
# Using @ as delimiter to avoid conflicts with slashes in URLs
# The pattern ${DOMAIN} is literal text we're searching for
echo "Replacing \${DOMAIN} with $CLEAN_DOMAIN..."
sed -i "s@\${DOMAIN}@$CLEAN_DOMAIN@g" nginx/nginx.conf

# Verify the replacement worked
echo ""
echo "=== Verification ==="
echo "Checking server_name lines:"
grep "server_name" nginx/nginx.conf | head -2
echo ""
echo "Checking SSL certificate paths:"
grep "ssl_certificate" nginx/nginx.conf
echo ""

# Check if replacement actually worked
if grep -q '${DOMAIN}' nginx/nginx.conf; then
    echo "ERROR: Domain replacement failed! \${DOMAIN} still present in config"
    exit 1
fi

echo "✓ Domain replacement successful!"

# Restart nginx
echo "Restarting nginx with new configuration..."
docker-compose up -d nginx

echo ""
echo "==================================="
echo "✓ SSL certificate generated successfully!"
echo "✓ Nginx configuration updated"
echo "✓ Your site is now accessible at https://$CLEAN_DOMAIN"
echo "==================================="
