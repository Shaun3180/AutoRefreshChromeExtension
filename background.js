let isExtensionActive = false;
let refreshIntervalID; // Store the interval ID for page refresh
let liketheElementClickIntervalID; // Store the interval ID for like theElement clicking

// Hard-coded values
const minPageRefreshInterval = 10 * 60 * 1000;    // 10 minutes min before page refreshes
const maxPageRefreshInterval = 100 * 60 * 1000;   // 100 minutes max before page refreshes
const minClickDelay = 3 * 1000;                   // 3 seconds min after a page is refreshed before a click occurs
const maxClickDelay = 100 * 1000;                 // 100 seconds max after a page is refrehsed before a click occurs
const minDelayBetweenElementClicks = 10 * 1000;   // if there are multiple matching elements on the page, the min delay between clicks
const maxDelayBetweenElementClicks = 100 * 1000;  // if there are multiple matching elements on the page, the min delay between clicks
const theSelector = 'div[aria-label="Like"]';     // Default selector
const openHour = 6;                             // 6:00 AM begin available time for clicks
const closeHour = 24;                           // midnight end available time for clicks

// Function to click the like theElement
function clickLiketheElement() {
    const now = new Date();
    const currentHour = now.getHours();

    // Check if the current hour is within the available hours
    if (currentHour >= openHour && currentHour < closeHour) {
        // Execute the script in the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => {
                    // Use theSelector to find and click the given element
                    const theElements = document.querySelectorAll(theSelector);

                    function getRandomDelay(minDelay, maxDelay) {
                        return Math.random() * (maxDelay - minDelay) + minDelay;
                    }

                    theElements.forEach((theElement, index) => {
                        if (isInViewport(theElement)) {
                            setTimeout(() => {
                                theElement.click();

                                // Display time when the element was clicked
                                console.log(`'${theSelector}' clicked at ${new Date().toLocaleString()}`);
                            }, getRandomDelay(minDelayBetweenElementClicks, maxDelayBetweenElementClicks) * index); // Random delay
                        }
                    });
                },
            });
        });
    }
}

// Function to generate a random time between minDelay and maxDelay (in milliseconds)
function getRandomDelay(minDelay, maxDelay) {
    return Math.random() * (maxDelay - minDelay) + minDelay;
}

// Function to refresh the page and set a new random interval
function refreshPageWithRandomInterval() {
    refreshPage();

    // Generate a new random interval for the next page refresh
    const randomInterval = getRandomDelay(minPageRefreshInterval, maxPageRefreshInterval);

    // Clear the previous interval and set a new one
    clearInterval(refreshIntervalID);
    refreshIntervalID = setInterval(refreshPageWithRandomInterval, randomInterval);
}

// Function to refresh the page
function refreshPage() {
    if (isExtensionActive) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => {
                    location.reload();
                },
            });
        });
    }
}

// Function to check if an element is in the viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}

// Function to toggle the extension's state
function toggleExtensionState() {
    isExtensionActive = !isExtensionActive;

    // Clear any existing intervals
    clearInterval(refreshIntervalID);
    clearInterval(liketheElementClickIntervalID);

    // Change the icon based on the extension's state
    const newIconPath = isExtensionActive ? "images/icon-active.png" : "images/icon-128.png";

    chrome.action.setIcon({ path: newIconPath });

    // Send a message to the content script to toggle the extension state
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Change the action to 'clickLiketheElement'
        chrome.tabs.sendMessage(tabs[0].id, { action: "clickLiketheElement", isExtensionActive });
    });

    // If extension is enabled, set up a new interval for like theElement clicking
    if (isExtensionActive) {
        liketheElementClickIntervalID = setInterval(clickLiketheElement, getRandomDelay(minClickDelay, maxClickDelay));
    }

    // If extension is enabled, refresh the page with a random interval
    if (isExtensionActive) {
        refreshPageWithRandomInterval();
    }
}

// Listen for clicks on the extension icon using chrome.action
chrome.action.onClicked.addListener(toggleExtensionState);

// Initialize the extension state and setup the initial intervals
chrome.storage.local.get("isExtensionActive", (data) => {
    if (data.isExtensionActive) {
        toggleExtensionState(); // Enable the extension if it was previously active
    } else {
        // Setup initial intervals if extension is disabled
        refreshPageWithRandomInterval();
        liketheElementClickIntervalID = setInterval(clickLiketheElement, getRandomDelay(minClickDelay, maxClickDelay));
    }
});
