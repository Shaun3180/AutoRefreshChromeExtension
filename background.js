let isExtensionActive = false;
const minRefreshInterval = 10 * 60 * 1000; // 10 minutes
const maxRefreshInterval = 90 * 60 * 1000; // 90 minutes
const minClickDelay = 3 * 1000; // 3 seconds
const maxClickDelay = 10 * 1000; // 10 seconds
const theSelector = 'div[aria-label="Like"]';

let refreshIntervalID; // Store the interval ID for page refresh
let likeButtonClickIntervalID; // Store the interval ID for like button clicking

// Function to generate a random time between minDelay and maxDelay (in milliseconds)
function getRandomDelay(minDelay, maxDelay) {
  return Math.random() * (maxDelay - minDelay) + minDelay;
}

// Function to refresh the page and set a new random interval
function refreshPageWithRandomInterval() {
  refreshPage();

  // Generate a new random interval for the next page refresh
  const randomInterval = getRandomDelay(minRefreshInterval, maxRefreshInterval);

  // Clear the previous interval and set a new one
  clearInterval(refreshIntervalID);
  refreshIntervalID = setInterval(refreshPageWithRandomInterval, randomInterval);
}

// Function to click the like button
function clickLikeButton() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: () => {
        const likeButtons = document.querySelectorAll(theSelector);
        for (const button of likeButtons) {
          button.click();
        }
      },
    });
  });
}

// Function to refresh the page
function refreshPage() {
  if (isExtensionActive) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => {
          location.reload();
        },
      });
    });
  }
}

// Function to toggle the extension's state
function toggleExtensionState() {
  isExtensionActive = !isExtensionActive;

  // Store the extension's state in chrome.storage.local
  chrome.storage.local.set({ isExtensionActive }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error storing extension state:', chrome.runtime.lastError);
      return;
    }

    // Change the icon based on the extension's state
    const newIconPath = isExtensionActive ? "images/icon-active.png" : "images/icon-128.png";

    chrome.action.setIcon({ path: newIconPath });

    // Send a message to the content script to toggle the extension state
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      // Change the action to 'clickLikeButton'
      chrome.tabs.sendMessage(tabs[0].id, { action: 'clickLikeButton', isExtensionActive });  
    });

    // If the extension is enabled, set up a new interval for like button clicking
    if (isExtensionActive) {
      likeButtonClickIntervalID = setInterval(clickLikeButton, getRandomDelay(minClickDelay, maxClickDelay));
    } else {
      // If the extension is disabled, clear the like button clicking interval
      clearInterval(likeButtonClickIntervalID);
    }
  });
}

// Listen for clicks on the extension icon using chrome.action
chrome.action.onClicked.addListener(toggleExtensionState);

// Initialize the extension state and set up the initial intervals
chrome.storage.local.get('isExtensionActive', data => {
  if (data.isExtensionActive) {
    toggleExtensionState(); // Enable the extension if it was previously active
  } else {
    // Set up initial intervals if the extension is disabled
    refreshPageWithRandomInterval();
    likeButtonClickIntervalID = setInterval(clickLikeButton, getRandomDelay(minClickDelay, maxClickDelay));
  }
});
