import { AMAZON_HOST, FILTER_PARAM_KEY, FILTER_PARAM_VALUE } from './constants';
import { TabStateManager } from './services/TabStateManager';
import { updateIcon } from './utils/icon';

/**
 * @fileoverview This script manages a Chrome extension that applies a "Sold by Amazon"
 * filter on Amazon Japan search results on a per-tab basis.
 *
 * @strategy
 * To provide a fast user experience, this version uses the `webNavigation.onBeforeNavigate`
 * event to intercept and redirect navigations before the page loads. State is managed
 * per-tab and encapsulated within the TabStateManager.
 */

// --- Event Listeners ---

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url) return;
  try {
    const isEnabled = await TabStateManager.getState(tab.id);
    const newState = !isEnabled;
    await TabStateManager.setState(tab.id, newState);
    await updateIcon(tab.id, newState);
    chrome.tabs.reload(tab.id);
  } catch (e) {
    console.error("Error handling action click:", e);
  }
});

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only act on main frame navigations
  if (details.frameId !== 0) {
    return;
  }

  const { tabId, url: urlString } = details;
  if (!urlString) return;

  try {
    const url = new URL(urlString);

    if (url.host !== AMAZON_HOST || !url.pathname.startsWith('/s')) {
      return;
    }

    if (await TabStateManager.isRedirecting(tabId)) {
      return;
    }

    const isEnabled = await TabStateManager.getState(tabId);
    const isFiltered = url.searchParams.get(FILTER_PARAM_KEY) === FILTER_PARAM_VALUE;

    const needsRedirect = (isEnabled && !isFiltered) || (!isEnabled && isFiltered);

    if (needsRedirect) {
      const newUrl = new URL(url);
      if (isEnabled) {
        newUrl.searchParams.set(FILTER_PARAM_KEY, FILTER_PARAM_VALUE);
      } else {
        newUrl.searchParams.delete(FILTER_PARAM_KEY);
      }
      await TabStateManager.setRedirecting(tabId, true);
      chrome.tabs.update(tabId, { url: newUrl.href });
    }
  } catch (e) {
    console.error("Error during beforeNavigate:", e);
  }
});

chrome.webNavigation.onCompleted.addListener(async (details) => {
  // Only act on main frame navigations
  if (details.frameId !== 0) {
    return;
  }

  const { tabId, url: urlString } = details;
  if (!urlString) return;

  try {
    const url = new URL(urlString);

    if (url.host !== AMAZON_HOST) {
      return;
    }

    const isEnabled = await TabStateManager.getState(tabId);
    await updateIcon(tabId, isEnabled);
    await TabStateManager.setRedirecting(tabId, false);
  } catch (e) {
    console.error("Error during navigation completed:", e);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  try {
    await TabStateManager.cleanup(tabId);
  } catch (e) {
    console.error("Error during tab removal cleanup:", e);
  }
});
