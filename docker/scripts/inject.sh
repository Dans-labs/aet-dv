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

# Download and load geospatial metadata block
echo "Loading geospatial metadata block..."
curl -sSf "https://raw.githubusercontent.com/IQSS/dataverse/v6.10.1/scripts/api/data/metadatablocks/geospatial.tsv" -o /tmp/geospatial.tsv
curl -X POST \
  -H "Content-type: text/tab-separated-values" \
  "http://dataverse:8080/api/admin/datasetfield/load?unblock-key=unblockme" \
  --upload-file /tmp/geospatial.tsv

# Enable metadata blocks on root collection
echo "Enabling metadata blocks on root collection..."
curl -X POST \
  -H "X-Dataverse-key: unblockme" \
  -H "Content-type: application/json" \
  "http://dataverse:8080/api/dataverses/root/metadatablocks?unblock-key=unblockme" \
  -d '["citation","geospatial"]'

echo "Plugin injected successfully!"