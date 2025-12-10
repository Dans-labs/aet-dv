import { type ReactElement, lazy, Suspense } from 'react';
import type { RootState, AppDispatch } from "./store";
import { TypedUseSelectorHook } from "react-redux";
import TerminalIcon from '@mui/icons-material/Terminal';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import KeyIcon from '@mui/icons-material/Key';
import PublicIcon from '@mui/icons-material/Public';
import { CircularProgress } from '@mui/material';

// Lazy load the heavy components
const SoftwareHeritageForm = lazy(() => 
  import('@dans-dv/swh-registration').then(m => ({ default: m.SoftwareHeritageForm }))
);
const Keywords = lazy(() => 
  import('@dans-dv/keywords').then(m => ({ default: m.Keywords }))
);
const FileUpload = lazy(() => 
  import('@dans-dv/file-upload').then(m => ({ default: m.FileUpload }))
);
const GeoData = lazy(() => 
  import('@dans-dv/geomap').then(m => ({ default: m.GeoData }))
);

export type MenuKey = 'swh' | 'fileUpload' | 'keywords' | 'geo';
export type KeywordsMenuKey = 'wikidata' | 'geonames' | 'elsst' | 'narcis' | 'dansCollectionsSsh' | 'gettyAat';

type DrawerRenderProps = {
  useAppDispatch: () => AppDispatch;
  useAppSelector: TypedUseSelectorHook<RootState>;
};

export type MenuItemConfig = {
  key: MenuKey;
  label: string;
  isEnabled: boolean;
  renderDrawerContent: (hooks: DrawerRenderProps) => ReactElement | null;
  icon: ReactElement;
};

export type MenuConfig = {
  swh?: boolean;
  fileUpload?: boolean;
  keywords?: {
    [K in KeywordsMenuKey]?: boolean;
  };
  geo?: {
    geonames?: boolean;
    map?: {
      draw?: {
        point?: boolean;
        line?: boolean;
        polygon?: boolean;
        rectangle?: boolean;
      };
    };
  };
};

// Loading fallback component
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
    <CircularProgress />
  </div>
);

export const getMenuItems = (config: MenuConfig): MenuItemConfig[] => [
  {
    key: 'swh',
    label: 'Register with Software Heritage',
    isEnabled: !!config.swh,
    renderDrawerContent: (props: DrawerRenderProps) => (
      <Suspense fallback={<LoadingFallback />}>
        <SoftwareHeritageForm {...props} />
      </Suspense>
    ),
    icon: <TerminalIcon />,
  },
  {
    key: 'fileUpload',
    label: 'Large file uploads and processing',
    isEnabled: !!config.fileUpload,
    renderDrawerContent: (props: DrawerRenderProps) => (
      <Suspense fallback={<LoadingFallback />}>
        <FileUpload {...props} />
      </Suspense>
    ),
    icon: <CloudUploadIcon />,
  },
  {
    key: 'keywords',
    label: 'Easy keyword management',
    isEnabled: !!config.keywords,
    renderDrawerContent: (props: DrawerRenderProps) => config.keywords ? (
      <Suspense fallback={<LoadingFallback />}>
        <Keywords {...props} config={config.keywords} />
      </Suspense>
    ) : null,
    icon: <KeyIcon />,
  },
  {
    key: 'geo',
    label: 'Geospatial data',
    isEnabled: !!config.geo,
    renderDrawerContent: (props: DrawerRenderProps) => config.geo ? (
      <Suspense fallback={<LoadingFallback />}>
        <GeoData {...props} config={config.geo} />
      </Suspense>
    ) : null,
    icon: <PublicIcon />,
  },
];