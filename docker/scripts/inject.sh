#!/bin/sh
set -e

echo "Waiting for Dataverse to be ready..."
until curl -sf "http://dataverse:8080/api/info/version" > /dev/null; do
  sleep 5
done

echo "Finding built JS file..."
INDEX_FILE=$(ls /plugin-dist/assets/index-*.js 2>/dev/null | head -n 1)

if [ -z "$INDEX_FILE" ]; then
  echo "Error: No built JS file found"
  exit 1
fi

BASENAME=$(basename "$INDEX_FILE")
echo "Found: $BASENAME"

echo "<script type=\"module\" src=\"http://localhost:9001/assets/${BASENAME}\"></script>" > /branding/custom-footer.html

echo "Registering footer with Dataverse..."
curl -X PUT \
  -H "X-Dataverse-key: unblockme" \
  -d '/var/www/dataverse/branding/custom-footer.html' \
  "http://dataverse:8080/api/admin/settings/:FooterCustomizationFile?unblock-key=unblockme"

echo "Plugin injected successfully!"