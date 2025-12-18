import { configureStore, type ThunkAction, type Action, type Middleware, type Reducer } from "@reduxjs/toolkit";
import { submitApi, submitDirectApi } from "@dans-dv/submit";

export interface FeatureItem {
  key: string;
  label: string;
  isEnabled: boolean;
}

interface FeatureModule {
  [key: string]: any;
}

interface FeatureConfig {
  module: () => Promise<FeatureModule>;
  exports: {
    reducer?: string;
    apis?: string[];
  };
  reducerKey?: string; // Optional custom key for the reducer in the store
}

const featureConfig: Record<string, FeatureConfig> = {
  swh: {
    module: () => import("@dans-dv/swh-registration"),
    exports: {
      reducer: "swhReducer",
      apis: ["codemetaApi"]
    },
    reducerKey: "swh"
  },
  fileUpload: {
    module: () => import("@dans-dv/file-upload"),
    exports: {
      reducer: "fileReducer",
      apis: ["dansFormatsApi"]
    },
    reducerKey: "files"
  },
  keywords: {
    module: () => import("@dans-dv/keywords"),
    exports: {
      reducer: "keywordsReducer",
      apis: ["datastationsApi", "wikidataApi", "dataverseApi"]
    },
    reducerKey: "keywords"
  },
  geo: {
    module: () => import("@dans-dv/geomap"),
    exports: {
      reducer: "geomapReducer",
      apis: ["geonamesApi", "wmsApi", "maptilerApi"]
    },
    reducerKey: "geomap"
  }
};

// Function to create store with only enabled features
export const createDynamicStore = async (items: FeatureItem[]) => {
  const reducers: Record<string, Reducer> = {
    // set default reducers here, always loaded
    [submitApi.reducerPath]: submitApi.reducer,
    [submitDirectApi.reducerPath]: submitDirectApi.reducer,
  };
  const middlewares: Middleware[] = [
    // set default middleware here, always loaded
    submitApi.middleware,
    submitDirectApi.middleware,
  ];

  // Get enabled feature keys
  const keys = items.map(item => item.key);

  // Load modules dynamically
  const loadPromises = keys.map(async (key) => {
    const config = featureConfig[key];
    if (!config) return;

    // Dynamically import the module
    const module = await config.module();

    // Add the main reducer if specified
    if (config.exports.reducer) {
      const reducerKey = config.reducerKey || key;
      reducers[reducerKey] = module[config.exports.reducer];
    }

    // Add API reducers and collect middleware
    if (config.exports.apis) {
      config.exports.apis.forEach(apiName => {
        const api = module[apiName];
        reducers[api.reducerPath] = api.reducer;
        middlewares.push(api.middleware);
      });
    }
  });

  // Wait for all modules to load
  await Promise.all(loadPromises);

  // Create store with dynamic configuration
  const store = configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(...middlewares)
  });

  return store;
};

export type AppStore = Awaited<ReturnType<typeof createDynamicStore>>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<AppStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
