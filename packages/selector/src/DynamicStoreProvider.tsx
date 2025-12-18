import { useState, useEffect, type FC } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { createDynamicStore } from "./store";
import type { AppStore } from "./store";
import type { FeatureItem } from "./store";
import { LoadingFallback } from "./menuConfig";

interface DynamicStoreProviderProps {
  menuItems: FeatureItem[];
  children: React.ReactNode;
}

export const DynamicStoreProvider: FC<DynamicStoreProviderProps> = ({ 
  menuItems, 
  children 
}) => {
  const [store, setStore] = useState<AppStore | null>(null);

  useEffect(() => {
    createDynamicStore(menuItems).then(setStore);
  }, [menuItems]);

  if (!store) {
    return <LoadingFallback />
  }

  return <ReduxProvider store={store}>{children}</ReduxProvider>
};