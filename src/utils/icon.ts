/**
 * Updates the extension icon and tooltip for a specific tab.
 */
export const updateIcon = async (tabId: number, isEnabled: boolean): Promise<void> => {
  const title = isEnabled
    ? "Disable 'Sold by Amazon' Filter (This Tab)"
    : "Enable 'Sold by Amazon' Filter (This Tab)";
  await chrome.action.setTitle({ tabId, title });
};
