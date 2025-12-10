import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { swhReducer, codemetaApi } from "@dans-dv/swh-registration";
import { submitApi, submitDirectApi } from "@dans-dv/submit";
import { dansFormatsApi, fileReducer } from "@dans-dv/file-upload";
import { keywordsReducer, datastationsApi, wikidataApi, dataverseApi } from "@dans-dv/keywords";
import { geomapReducer, geonamesApi, wmsApi, maptilerApi } from "@dans-dv/geomap";

export const store = configureStore({
  reducer: {
    swh: swhReducer,
    files: fileReducer,
    keywords: keywordsReducer,
    geomap: geomapReducer,
    [codemetaApi.reducerPath]: codemetaApi.reducer,
    [submitApi.reducerPath]: submitApi.reducer,
    [submitDirectApi.reducerPath]: submitDirectApi.reducer,
    [dansFormatsApi.reducerPath]: dansFormatsApi.reducer,
    [datastationsApi.reducerPath]: datastationsApi.reducer,
    [dataverseApi.reducerPath]: dataverseApi.reducer,
    [wikidataApi.reducerPath]: wikidataApi.reducer,
    [geonamesApi.reducerPath]: geonamesApi.reducer,
    [wmsApi.reducerPath]: wmsApi.reducer,
    [maptilerApi.reducerPath]: maptilerApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(codemetaApi.middleware)
      .concat(submitApi.middleware)
      .concat(submitDirectApi.middleware)
      .concat(dansFormatsApi.middleware)
      .concat(datastationsApi.middleware)
      .concat(wikidataApi.middleware)
      .concat(geonamesApi.middleware)
      .concat(dataverseApi.middleware)
      .concat(wmsApi.middleware)
      .concat(maptilerApi.middleware)
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
