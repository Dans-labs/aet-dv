# Advanced Editing Toolkit - a React plugin for Dataverse

This plugin is designed to add advanced editing functions for metadata inside Dataverse. In combination with the ACP, this includes functionality like large (TUS) file uploads, file processing (e.g. automatic speech recognition), automatic software registration with Software Heritage, an interactive map with coordinate conversion, keyword management, etc.

The plugin is highly modular and can easily be adapted for specific Dataverse instances. These specific applications live in the `./apps` folder and take a very basic configuration.

## How to setup your dev env

* [PNPM](https://pnpm.io/installation) must be installed on your system
* Install dependencies, in the root dir run `pnpm i`
* Run the app dev server, e.g. `pnpm dev:eosc`
* You can now test the application outside of Dataverse by visiting the Vite dev server address.

For testing within a Dataverse environment, follow these steps:

* Grab the plugin [Tampermonkey](https://www.tampermonkey.net/) for your browser, and make sure developer mode is active (if using Chrome)
* Grab a CORS unblocking extension for your browser to bypass CORS requests on the appropriate Dataverse URL (needed for script injection from localhost)
* Add a new script in Tampermonkey, and paste in the contents of the appropriate `apps/{appName}/tamperMonkeyScript.js` (be sure to adjust your development server address if needed)
* Visit the appropriate Dataverse site, log in, and select a dataset you can edit. You should see an Advanced Edit button rendered below the default editing action buttons.

## Creating and configuring apps

Setting up an app for a Dataverse instance needs minimal configuration.

### Selector component

The `Selector` component is configured with multiple feature flags that enable various data selection and input capabilities.

```tsx
import { Selector } from '@dans-dv/selector'

function App() {
  return (
    <Selector config={{
      swh: true,
      fileUpload: true,
      keywords: {
        wikidata: true,
        gettyAat: true,
        elsst: true,
        narcis: true,
        dansCollectionsSsh: true,
      },
      geo: {
        geonames: true,
        map: {
          draw: {
            point: true,
            line: true,
            polygon: true,
            rectangle: true,
          },
        },
      },
    }} />
  )
}
```

### Configuration options

All boolean options can be set to `true` (enabled) or `false` (disabled) based on your requirements.

#### Top-Level Features

- **`swh`**: Enabled - Software Heritage integration
- **`fileUpload`**: Enabled - File upload and processing functionality

#### Keywords Configuration

The `keywords` object controls which keyword/vocabulary services are available:

- **`wikidata`**: Enabled - Wikidata keyword selection
- **`gettyAat`**: Enabled - Getty Art & Architecture Thesaurus integration
- **`elsst`**: Enabled - European Language Social Science Thesaurus
- **`narcis`**: Enabled - NARCIS (Dutch research portal) keywords
- **`dansCollectionsSsh`**: Enabled - DANS Collections SSH vocabulary

#### Geographic Configuration

The `geo` object manages geographic selection features:

##### Geonames
- **`geonames`**: Enabled - GeoNames geographic database integration

##### Map Drawing Tools
The `map.draw` object controls which drawing tools are available on the map:

- **`point`**: Enabled - Users can draw point markers
- **`line`**: Enabled - Users can draw lines
- **`polygon`**: Enabled - Users can draw polygonal areas
- **`rectangle`**: Enabled - Users can draw rectangular areas

## Application Wrapper Configuration

The application is initialized using the `@dans-dv/wrapper` package, which handles mounting and environment-specific behavior.

### Implementation

```javascript
import App from './App'
import { createApp } from '@dans-dv/wrapper'

createApp({
  app: <App />,
  appendToId: 'actionButtonBlock',
  requireChildId: process.env.NODE_ENV !== 'development' ? 'editDataSet' : undefined,
})
```

### Wrapper Options

- **`app`**: `<App />` - The React component to render (the Selector component configured above)
- **`appendToId`**: `'actionButtonBlock'` - The DOM element ID where the application will be mounted
- **`requireChildId`**: Conditional rendering, based on environment:
  - **Production**: `'editDataSet'` - Requires a child element with this ID to be present before mounting
  - **Development**: `undefined` - No child element requirement, allowing the app to mount freely for easier testing

### Environment Behavior

The `requireChildId` configuration is optional, and creates different behaviors across environments:

- **Development Mode**: The app mounts without restrictions, making it easier to develop and test
- **Production Mode**: The app only mounts if an element with ID `editDataSet` exists as a child of the id specified under `appendToId`, providing a safety check that ensures the app runs in the correct context, i.e. is only usable when a Dataverse user has editing capabilities

## Build and deployment

This app features a Github Action which builds and deploys a toolkit application. It can be adapted for different environments and be used for different toolkit configurations/apps.