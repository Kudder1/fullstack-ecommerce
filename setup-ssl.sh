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

# Get certificate (skip if already exists)
if [ -f "certbot/conf/live/$CLEAN_DOMAIN/fullchain.pem" ]; then
    echo "✓ Certificate already exists for $CLEAN_DOMAIN"
    echo "  Location: certbot/conf/live/$CLEAN_DOMAIN/"
    echo "  Skipping certificate generation..."
    echo ""
else
    echo "Certificate not found. Requesting from Let's Encrypt..."
    echo "Domain: $CLEAN_DOMAIN"
    echo "Email: $AWS_SES_SENDER"
    echo ""
    
    # Create necessary directories with proper permissions
    mkdir -p certbot/conf certbot/www
    
    # Stop ALL containers to free up port 80 (nginx must not be running)
    echo "Stopping all containers to free port 80..."
    docker-compose down || true
    sleep 3
    
    # Start only nginx for webroot verification
    echo "Starting nginx for certificate verification..."
    docker-compose up -d nginx
    sleep 3
    
    # Request certificate using webroot method
    echo "Requesting SSL certificate from Let's Encrypt (this may take 60-90 seconds)..."
    echo ""
    
    MAX_RETRIES=3
    RETRY_COUNT=0
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        echo "Attempt $((RETRY_COUNT + 1)) of $MAX_RETRIES..."
        
        docker-compose run --rm --entrypoint certbot certbot certonly \
            --webroot \
            --webroot-path /var/www/certbot \
            --email "$AWS_SES_SENDER" \
            --agree-tos \
            --no-eff-email \
            --non-interactive \
            --preferred-challenges http \
            -d "$CLEAN_DOMAIN" \
            -d "www.$CLEAN_DOMAIN" \
            2>&1
        
        CERT_STATUS=$?
        
        if [ -f "certbot/conf/live/$CLEAN_DOMAIN/fullchain.pem" ]; then
            echo ""
            echo "✓ Certificate obtained successfully!"
            break
        elif [ $RETRY_COUNT -lt $((MAX_RETRIES - 1)) ]; then
            RETRY_COUNT=$((RETRY_COUNT + 1))
            echo "Certificate request failed. Retrying in 10 seconds..."
            sleep 10
        else
            RETRY_COUNT=$((RETRY_COUNT + 1))
            echo ""
            echo "WARNING: Certificate request failed after $RETRY_COUNT attempts"
            echo "This may be because:"
            echo "  1. Port 80 is not accessible from the internet"
            echo "  2. Your domain DNS is not pointing to this server"
            echo "  3. Let's Encrypt rate limit exceeded"
            echo ""
            echo "Continuing with HTTP-only configuration..."
        fi
    done
fi

# Check if we have an SSL certificate
if [ -f "certbot/conf/live/$CLEAN_DOMAIN/fullchain.pem" ]; then
    echo ""
    echo "Setting up SSL configuration..."
    
    # Update nginx configuration to use SSL
    echo "Copying nginx-ssl.conf to nginx.conf..."
    cp nginx/nginx-ssl.conf nginx/nginx.conf
    
    # Replace ${DOMAIN} with actual domain
    echo "Replacing \${DOMAIN} with $CLEAN_DOMAIN..."
    sed -i "s|\${DOMAIN}|$CLEAN_DOMAIN|g" nginx/nginx.conf
    
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
    if grep -q '\${DOMAIN}' nginx/nginx.conf; then
        echo "ERROR: Domain replacement failed! \${DOMAIN} still present in config"
        exit 1
    fi
    
    echo "✓ Domain replacement successful!"
    
    # Restart all containers with SSL config
    echo "Starting all containers with SSL configuration..."
    docker-compose up -d
    sleep 3
    
    echo ""
    echo "==================================="
    echo "✓ SSL setup completed successfully!"
    echo "✓ Your site is now accessible at https://$CLEAN_DOMAIN"
    echo "==================================="
else
    echo ""
    echo "Keeping HTTP-only configuration"
    echo "Site will remain accessible at http://$CLEAN_DOMAIN"
    echo ""
    echo "To request a certificate later, run: ./setup-ssl.sh"
    
    # Restart nginx with HTTP config
    echo "Starting nginx..."
    docker-compose up -d nginx
fi
