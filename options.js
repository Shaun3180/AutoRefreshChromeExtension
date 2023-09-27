const DEFAULT_MIN_PAGE_REFRESH_INTERVAL = 10 * 1000;        // 10 seconds
const DEFAULT_MAX_PAGE_REFRESH_INTERVAL = 20 * 1000;        // 20 seconds
const DEFAULT_MIN_CLICK_DELAY = 1 * 1000;                   // 1 seconds
const DEFAULT_MAX_CLICK_DELAY = 2 * 1000;                   // 2 seconds
const DEFAULT_MIN_DELAY_BETWEEN_ELEMENT_CLICKS = 1 * 1000;  // 1 second
const DEFAULT_MAX_DELAY_BETWEEN_ELEMENT_CLICKS = 2 * 1000;  // 2 seconds
const DEFAULT_SELECTOR = 'div[aria-label="Like"]';
const DEFAULT_OPEN_HOUR = 6;                                // 6am
const DEFAULT_CLOSE_HOUR = 22;                              // 10pm

document.addEventListener('DOMContentLoaded', () => {
  // Retrieve configuration values from Chrome storage.sync
  chrome.storage.sync.get(
    ['minPageRefreshInterval', 'maxPageRefreshInterval', 'minClickDelay', 'maxClickDelay', 'minDelayBetweenElementClicks', 'maxDelayBetweenElementClicks', 'theSelector', 'openHour', 'closeHour'],
    (result) => {
      // Set default values if they are not present in storage
      if (!result.minPageRefreshInterval) {
        chrome.storage.sync.set({ minPageRefreshInterval:  DEFAULT_MIN_PAGE_REFRESH_INTERVAL});
      }
      if (!result.maxPageRefreshInterval) {
        chrome.storage.sync.set({ maxPageRefreshInterval: DEFAULT_MAX_PAGE_REFRESH_INTERVAL });
      }
      if (!result.minClickDelay) {
        chrome.storage.sync.set({ minClickDelay: DEFAULT_MIN_CLICK_DELAY });
      }
      if (!result.maxClickDelay) {
        chrome.storage.sync.set({ maxClickDelay: DEFAULT_MAX_CLICK_DELAY });
        result.maxClickDelay = DEFAULT_MAX_CLICK_DELAY;
      }
      if (!result.minDelayBetweenElementClicks) {
        chrome.storage.sync.set({ minDelayBetweenElementClicks: DEFAULT_MIN_DELAY_BETWEEN_ELEMENT_CLICKS });
      }
      if (!result.maxDelayBetweenElementClicks) {
        chrome.storage.sync.set({ maxDelayBetweenElementClicks: DEFAULT_MAX_DELAY_BETWEEN_ELEMENT_CLICKS });
      }
      if (!result.theSelector) {
        chrome.storage.sync.set({ theSelector: DEFAULT_SELECTOR });
      }
      if (!result.openHour) {
        chrome.storage.sync.set({ openHour: DEFAULT_OPEN_HOUR });
      }
      if (!result.closeHour) {
        chrome.storage.sync.set({ closeHour: DEFAULT_CLOSE_HOUR });
      }

      // Set the input values in the options form based on values in storage
      document.getElementById('minPageRefreshInterval').value = result.minPageRefreshInterval || DEFAULT_MIN_PAGE_REFRESH_INTERVAL;
      document.getElementById('maxPageRefreshInterval').value = result.maxPageRefreshInterval || DEFAULT_MAX_PAGE_REFRESH_INTERVAL;
      document.getElementById('minClickDelay').value = result.minClickDelay || DEFAULT_MIN_CLICK_DELAY;
      document.getElementById('maxClickDelay').value = result.maxClickDelay || DEFAULT_MAX_CLICK_DELAY;
      document.getElementById('minDelayBetweenElementClicks').value = result.minDelayBetweenElementClicks || DEFAULT_MIN_DELAY_BETWEEN_ELEMENT_CLICKS;
      document.getElementById('maxDelayBetweenElementClicks').value = result.maxDelayBetweenElementClicks || DEFAULT_MAX_DELAY_BETWEEN_ELEMENT_CLICKS;
      document.getElementById('theSelector').value = result.theSelector || DEFAULT_SELECTOR;
      document.getElementById('openHour').value = result.openHour || DEFAULT_OPEN_HOUR;
      document.getElementById('closeHour').value = result.closeHour || DEFAULT_CLOSE_HOUR;
    }
  );

  // Handle form submission
  document.getElementById('options-form').addEventListener('submit', (event) => {
    event.preventDefault();

    // Get values from the form inputs
    const minPageRefreshInterval = parseInt(document.getElementById('minPageRefreshInterval').value);
    const maxPageRefreshInterval = parseInt(document.getElementById('maxPageRefreshInterval').value);
    const minClickDelay = parseInt(document.getElementById('minClickDelay').value);
    const maxClickDelay = parseInt(document.getElementById('maxClickDelay').value);
    const minDelayBetweenElementClicks = parseInt(document.getElementById('minDelayBetweenElementClicks').value);
    const maxDelayBetweenElementClicks = parseInt(document.getElementById('maxDelayBetweenElementClicks').value);
    const theSelector = document.getElementById('theSelector').value;
    const openHour = document.getElementById('openHour').value;
    const closeHour = document.getElementById('closeHour').value;

    // Save options to Chrome's storage.sync
    chrome.storage.sync.set({
      minPageRefreshInterval,
      maxPageRefreshInterval,
      minClickDelay,
      maxClickDelay,
      minDelayBetweenElementClicks,
      maxDelayBetweenElementClicks,
      theSelector,
      openHour,
      closeHour,
    }, () => {
      // Display a confirmation message after saving
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 1500);
    });
  });
});
