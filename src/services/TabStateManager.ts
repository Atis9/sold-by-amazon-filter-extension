/**
 * Manages all state for tabs stored in `chrome.storage.session`.
 */
export const TabStateManager = {
  _getStateKey: (tabId: number): string => `tab_${tabId}_enabled`,
  _getRedirectingFlagKey: (tabId: number): string => `tab_${tabId}_redirecting`,

  /** Gets the filter state for a tab. Defaults to true (enabled). */
  async getState(tabId: number): Promise<boolean> {
    const key = this._getStateKey(tabId);
    const result = await chrome.storage.session.get(key);
    return result[key] ?? true;
  },

  /** Sets the filter state for a tab. */
  async setState(tabId: number, isEnabled: boolean): Promise<void> {
    const key = this._getStateKey(tabId);
    await chrome.storage.session.set({ [key]: isEnabled });
  },

  /** Checks if a tab is currently being redirected. */
  async isRedirecting(tabId: number): Promise<boolean> {
    const key = this._getRedirectingFlagKey(tabId);
    const result = await chrome.storage.session.get(key);
    return result[key] ?? false;
  },

  /** Sets a tab's redirecting flag. */
  async setRedirecting(tabId: number, isRedirecting: boolean): Promise<void> {
    const key = this._getRedirectingFlagKey(tabId);
    if (isRedirecting) {
      await chrome.storage.session.set({ [key]: true });
    } else {
      await chrome.storage.session.remove(key);
    }
  },

  /** Cleans up all stored state for a closed tab. */
  async cleanup(tabId: number): Promise<void> {
    const stateKey = this._getStateKey(tabId);
    const redirectingKey = this._getRedirectingFlagKey(tabId);
    await chrome.storage.session.remove([stateKey, redirectingKey]);
  },
};
