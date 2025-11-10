import type { ReactNode } from "react";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, Theme } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import { baseTheme } from "./basetheme";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import CssBaseline from '@mui/material/CssBaseline';
import { ApiTokenProvider } from './apiTokenContext';
import { ShadowRootContext } from './shadowRootContext';

export function createApp({ 
  app, 
  appendToId, 
  theme,
  requireChildId
}: { 
  app: ReactNode; 
  appendToId: string; 
  theme?: Partial<Theme>;
  requireChildId?: string;
}) {
  const targetElement = document.querySelector(`#${appendToId}`);

  // If requireChildId is specified, check if that element exists within targetElement
  if (requireChildId) {
    const requiredChild = targetElement?.querySelector(`#${requireChildId}`);
    if (!requiredChild) {
      console.log(`Element #${requireChildId} not found in #${appendToId}, skipping app creation`);
      return;
    }
  }

  const shadowHost = document.createElement('div');

  // Insert the shadow host after the target element
  targetElement?.parentNode?.insertBefore(shadowHost, targetElement.nextSibling);

  // Create Shadow DOM on the new host
  const shadowContainer = shadowHost.attachShadow({ mode: 'open' });

  const shadowRootElement = document.createElement('div');
  shadowContainer?.appendChild(shadowRootElement);

  const cache = createCache({
    key: 'css',
    prepend: true,
    container: shadowContainer,
  });

  // Set the main font size to 16px, as MUI works with Rems. DV with px, so that shouldn´t matter
  document.documentElement.style.fontSize = '16px';

  const customTheme = createTheme(deepmerge(baseTheme(shadowRootElement), theme));

  const reactAppContainer = document.createElement('div');
  shadowRootElement.appendChild(reactAppContainer);

  createRoot(reactAppContainer).render(
    <StrictMode>
      <CacheProvider value={cache}>
        <ThemeProvider theme={customTheme}>
          <ShadowRootContext.Provider value={shadowContainer}>
            <ApiTokenProvider>
              <CssBaseline />
              {app}
            </ApiTokenProvider>
          </ShadowRootContext.Provider>
        </ThemeProvider>
      </CacheProvider>
    </StrictMode>
  );
}