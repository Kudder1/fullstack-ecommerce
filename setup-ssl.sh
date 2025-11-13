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

# Get certificate (skip if already exists)
if [ -d "certbot/conf/live/$CLEAN_DOMAIN" ]; then
    echo "Certificate already exists for $CLEAN_DOMAIN, skipping certbot..."
else
    echo "Setting up HTTP-only nginx for certificate verification..."
    
    # Temporarily use HTTP-only config so nginx can serve certbot challenges
    cp nginx/nginx.conf nginx/nginx.conf.backup 2>/dev/null || true
    
    # Create temporary HTTP-only config with certbot challenge location
    # This config doesn't reference the "server" container to avoid DNS issues
    cat > nginx/nginx.conf << NGINX_EOF
server {
    listen 80;
    server_name $CLEAN_DOMAIN www.$CLEAN_DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'SSL certificate setup in progress...';
        add_header Content-Type text/plain;
    }
}
NGINX_EOF
    
    # Start/restart nginx with HTTP config
    docker-compose up -d nginx
    echo "Waiting for nginx to start..."
    sleep 5
    
    # Get certificate
    echo "Requesting SSL certificate from Let's Encrypt..."
    docker-compose run --rm certbot certonly --webroot \
        --webroot-path=/var/www/certbot \
        --email $AWS_SES_SENDER \
        --agree-tos \
        --no-eff-email \
        --non-interactive \
        -d $CLEAN_DOMAIN \
        -d www.$CLEAN_DOMAIN
    
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to obtain SSL certificate"
        exit 1
    fi
fi

# Update nginx configuration to use SSL
echo "Copying nginx-ssl.conf to nginx.conf..."
cp nginx/nginx-ssl.conf nginx/nginx.conf

# Replace ${DOMAIN} with actual domain using awk (more reliable than sed)
echo "Replacing \${DOMAIN} with $CLEAN_DOMAIN..."
awk -v domain="$CLEAN_DOMAIN" '{gsub(/\$\{DOMAIN\}/, domain)}1' nginx/nginx.conf > nginx/nginx.conf.tmp
mv nginx/nginx.conf.tmp nginx/nginx.conf

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
