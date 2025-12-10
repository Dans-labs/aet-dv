/// <reference path="./types/index.ts" />

import type { TypedUseSelectorHook } from "react-redux";
import { useApiToken } from "@dans-dv/wrapper";
import { TabHeader, BoxWrap } from "@dans-dv/layout";
import DrawMap from "./Map";
import { Submit, useSubmitDataMutation } from "@dans-dv/submit";
import { getFeatures, setFeatures, type GeomapState, type ExtendedMapFeature } from "./slice";

export type RootState = {geomap: GeomapState};
export type AppDispatch = (action: any) => any;
export type AppSelector = TypedUseSelectorHook<RootState>;
export type ReduxProps = {
  useAppDispatch: AppDispatch;
  useAppSelector: AppSelector;
}
export type DrawConfig = {
  point?: boolean;
  line?: boolean;
  polygon?: boolean;
  rectangle?: boolean;
}

export default function GeoData({ config, useAppDispatch, useAppSelector }: {
  useAppDispatch: () => AppDispatch;
  useAppSelector: TypedUseSelectorHook<RootState>;
  config: {
    geonames?: boolean;
    map?: {
      draw?: DrawConfig;
    };
  }
}) {
  const [ submitData, { isLoading, isSuccess, isError } ] = useSubmitDataMutation();
  const { apiToken, doi } = useApiToken();
  const dispatch = useAppDispatch();
  const value = useAppSelector(getFeatures());

  const setFeaturesValue = (features: ExtendedMapFeature[]) => {
    dispatch(setFeatures(features));
  };

  return (
    <BoxWrap width={60}>
      <TabHeader
        title="Geospatial data"
        subtitle="Start by adding a Geonames location directly, or by drawing points or rectangles on the map and link them to a Geonames location. If your data is not in WSG-84, you can select your coordinate reference system below."
      />
      { config.map && <DrawMap setValue={setFeaturesValue} value={value} draw={config.map.draw} /> }

      <Submit 
        disabled={value.length === 0 || isLoading}
        isLoading={isLoading}
        isError={isError}
        isSuccess={isSuccess}
        onClick={() => submitData({ data: value, id: doi, apiToken: apiToken })}
      />

    </BoxWrap>
  );
}