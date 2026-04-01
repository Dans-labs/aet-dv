#!/bin/sh
set -e

echo "Waiting for Dataverse to be ready..."
until curl -sf "http://dataverse:8080/api/info/version" > /dev/null; do
  sleep 5
done

echo "Waiting for Vite dev server to be ready..."
until curl -s "http://plugin-dev:5173" > /dev/null 2>&1; do
  sleep 2
done

echo "Writing dev footer..."
cat > /branding/custom-footer.html << 'EOF'
<script type="module">
  import RefreshRuntime from 'http://localhost:5173/@react-refresh'
  RefreshRuntime.injectIntoGlobalHook(window)
  window.$RefreshReg$ = () => {}
  window.$RefreshSig$ = () => () => {}
  window.__vite_plugin_react_preamble_installed__ = true
</script>
<script type="module" src="http://localhost:5173/src/main.tsx"></script>
EOF

echo "Registering footer with Dataverse..."
curl -X PUT \
  -H "X-Dataverse-key: unblockme" \
  -d '/var/www/dataverse/branding/custom-footer.html' \
  "http://dataverse:8080/api/admin/settings/:FooterCustomizationFile?unblock-key=unblockme"

echo "Loading geospatial metadata block..."
curl -sSf "https://raw.githubusercontent.com/IQSS/dataverse/v6.10.1/scripts/api/data/metadatablocks/geospatial.tsv" -o /tmp/geospatial.tsv
curl -X POST \
  -H "Content-type: text/tab-separated-values" \
  "http://dataverse:8080/api/admin/datasetfield/load?unblock-key=unblockme" \
  --upload-file /tmp/geospatial.tsv

echo "Enabling metadata blocks on root collection..."
curl -X POST \
  -H "X-Dataverse-key: unblockme" \
  -H "Content-type: application/json" \
  "http://dataverse:8080/api/dataverses/root/metadatablocks?unblock-key=unblockme" \
  -d '["citation","geospatial"]'

echo "Done!"