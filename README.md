# Advanced Editing Toolkit - a React plugin for Dataverse
This plugin is designed to add advanced editing functions for metadata inside Dataverse. In combination with the ACP, this includes functionality like large (TUS) file uploads, file processing (e.g. automatic speech recognition), automatic software registration with Software Heritage, an interactive map with coordinate conversion, keyword management, etc.

## How to setup your dev env
* [PNPM](https://pnpm.io/installation) must be installed on your system
* Grab the plugin [Tampermonkey](https://www.tampermonkey.net/) for your browser, and make sure developer mode is active (if using Chrome)
* Grab a CORS unblocking extension for your browser to bypass CORS requests on the appropriate Dataverse URL (needed for script injection from localhost)
* Add a new script in Tampermonkey, and paste in the contents of the appropriate `apps/{appName}/tamperMonkeyScipt.js` (be sure to adjust your dev server address if needed)
* Install dependencies, in the root dir run `pnpm i`
* Run the app dev server, e.g. `pnpm dev:eosc`
* Visit the appropriate Dataverse site and select a dataset you can edit. You should see an Advanced Edit button rendered below the default editing action buttons.

## Build and deployment
This app features a Github Action which builds and deploys a toolkit application. It can be adapted for different environments and be used for different toolkit configurations/apps.
