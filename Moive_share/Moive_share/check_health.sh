#!/bin/bash

# Load API keys from .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "🏥 Starting Stack Health Check..."

# Function to check service
check_service() {
    local NAME=$1
    local URL=$2
    local API_KEY=$3
    
    echo -n "🔍 Checking $NAME... "
    
    # Try to connect
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "X-Api-Key: $API_KEY" "$URL/api/v3/system/status")
    
    if [ "$RESPONSE" == "200" ]; then
        echo "✅ OK"
    else
        echo "❌ FAILED (HTTP $RESPONSE)"
    fi
}

# qBittorrent check (just port check)
echo -n "🔍 Checking qBittorrent... "
if nc -z localhost 8080; then
    echo "✅ WebUI Port Open"
else
    echo "❌ WebUI Port Closed"
fi

# Sonarr
check_service "Sonarr" "http://localhost:8989" "$SONARR_API_KEY"

# Radarr
check_service "Radarr" "http://localhost:7878" "$RADARR_API_KEY"

# Prowlarr
check_service "Prowlarr" "http://localhost:9696" "$PROWLARR_API_KEY"

echo "🏁 Health check complete."
