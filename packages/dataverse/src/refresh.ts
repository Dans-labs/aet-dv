export {};

declare global {
  interface PrimeFacesAjaxOptions {
    s: string;                    // jakarta.faces.source
    f: string;                    // form id
    e?: string;                   // behavior event, e.g. 'tabChange'
    p?: string;                   // partial.execute
    u?: string;                   // partial.render
    params?: Array<{ name: string; value: string | number }>;
    oncomplete?: () => void;      // some PF versions
    onco?: () => void;            // shorthand used by PF-generated code
    onerror?: () => void;
  }

  interface Window {
    PrimeFaces: {
      ab: (options: PrimeFacesAjaxOptions) => void;
    };
  }
}

// Functions to refresh the active tab in the Dataverse UI after API interactions
export function refreshActiveTab(
  formId = 'datasetForm',
  tabViewId = 'datasetForm:tabView',
): Promise<string> {
  return new Promise((resolve, reject) => {
    const idxInput = document.getElementById(`${tabViewId}_activeIndex`) as HTMLInputElement | null;
    if (!idxInput) return reject(new Error('activeIndex input not found'));
    const index = parseInt(idxInput.value, 10) || 0;

    const tabView = document.getElementById(tabViewId);
    const panels = tabView?.querySelectorAll<HTMLElement>(':scope > .ui-tabs-panels > .ui-tabs-panel');
    let newTab = panels?.[index]?.id;
    if (!newTab) {
      const headers = tabView?.querySelectorAll<HTMLElement>(':scope > .ui-tabs-nav > li');
      newTab = headers?.[index]?.getAttribute('aria-controls') ?? undefined;
    }
    if (!newTab) return reject(new Error(`No panel found for tab index ${index}`));

    const done = () => resolve(newTab!);
    window.PrimeFaces.ab({
      s: tabViewId,
      f: formId,
      e: 'tabChange',
      p: tabViewId,
      u: tabViewId,
      params: [
        { name: `${tabViewId}_newTab`, value: newTab },
        { name: `${tabViewId}_tabindex`, value: index },
      ],
      oncomplete: done,
      onco: done, // whichever your PF version honors; resolve() is idempotent
      onerror: () => reject(new Error('PrimeFaces ajax error')),
    });
  });
}

export async function refreshAfterApi() {
  const tabView = document.getElementById('datasetForm:tabView');
  if (tabView) tabView.style.opacity = '0.5';      // optional: soften the swap
  try {
    await refreshActiveTab();
  } catch (e) {
    console.warn('Partial refresh failed, reloading', e);
    location.reload();                              // safety net
  } finally {
    // tabView is a fresh node after the render, so look it up again
    const fresh = document.getElementById('datasetForm:tabView');
    if (fresh) fresh.style.opacity = '';
  }
}