import { createTheme } from "@mui/material/styles";

export function baseTheme(shadowRootElement: HTMLElement) {
  return (
    createTheme({
      zIndex: {
        modal: 9999,
        drawer: 9999,
        tooltip: 99999,
      },
      components: {
        MuiPopover: {
          defaultProps: {
            container: shadowRootElement,
          },
        },
        MuiPopper: {
          defaultProps: {
            container: shadowRootElement,
          },
        },
        MuiModal: {
          defaultProps: {
            container: shadowRootElement,
          },
        },
        MuiDrawer: {
          defaultProps: {
            container: shadowRootElement,
          },
        },
      },
    })
  )
};
