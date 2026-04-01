import type { Feature, LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from "geojson";
import type { GeonamesOption } from './slice'

export function isRectangle(coords: number[][]): boolean {
  if (!Array.isArray(coords) || coords.length < 5) return false;

  // Ensure polygon is closed
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) return false;


  const corners = coords.slice(0, -1);
  if (corners.length !== 4) return false;

  const isPerpendicular = (p1: number[], p2: number[], p3: number[]): boolean => {
    const v1: number[] = [p2[0] - p1[0], p2[1] - p1[1]];
    const v2: number[] = [p3[0] - p2[0], p3[1] - p2[1]];
    const dot = v1[0] * v2[0] + v1[1] * v2[1];
    return Math.abs(dot) < 1e-10;
  };

  for (let i = 0; i < 4; i++) {
    const p1 = corners[i];
    const p2 = corners[(i + 1) % 4];
    const p3 = corners[(i + 2) % 4];
    if (!isPerpendicular(p1, p2, p3)) return false;
  }

  return true;
}

export interface GeoFeature extends Feature<Polygon | LineString | Point | MultiPoint | MultiLineString | MultiPolygon> {
  geonames?: GeonamesOption
}

// DV primitive field
const primitive = (typeName: string, value: string) => ({
  typeName,
  multiple: false,
  typeClass: 'primitive',
  value,
})

// Extract bounding box from any geometry type
function getBoundingBox(feature: GeoFeature) {
  const { geometry } = feature
  let coords: [number, number][] = []

  if (geometry.type === 'Point') {
    coords = [geometry.coordinates as [number, number]]
  } else if (geometry.type === 'LineString') {
    coords = geometry.coordinates as [number, number][]
  } else if (geometry.type === 'Polygon') {
    coords = geometry.coordinates[0] as [number, number][]
  }

  if (coords.length === 0) return null

  const lngs = coords.map(c => c[0])
  const lats = coords.map(c => c[1])

  return {
    westLongitude: primitive('westLongitude', String(Math.min(...lngs))),
    eastLongitude: primitive('eastLongitude', String(Math.max(...lngs))),
    northLatitude: primitive('northLatitude', String(Math.max(...lats))),
    southLatitude: primitive('southLatitude', String(Math.min(...lats))),
  }
}

export function featuresToDvGeospatial(features: GeoFeature[]) {
  const boundingBoxes = features
    .map(getBoundingBox)
    .filter(Boolean)

  return {
    fields: [
      {
        typeName: 'geographicBoundingBox',
        multiple: true,
        typeClass: 'compound',
        value: boundingBoxes,
      },
    ]
  }
}