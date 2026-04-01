import { Selector } from '@aet-dv/selector'

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

export default App
