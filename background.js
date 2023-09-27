// Global variables
let isExtensionActive = false;
let refreshIntervalID;
let liketheElementClickIntervalID;
let minPageRefreshInterval;
let maxPageRefreshInterval;
let minClickDelay;
let maxClickDelay;
let minDelayBetweenElementClicks;
let maxDelayBetweenElementClicks;
let theSelector;
let openHour;
let closeHour;

let configLoaded = false;

// Function to load configuration settings from storage
function loadConfig(callback) {
    if (configLoaded) {
        return callback();
    }

    chrome.storage.sync.get(
        ["minPageRefreshInterval", "maxPageRefreshInterval", "minClickDelay", "maxClickDelay", "minDelayBetweenElementClicks", "maxDelayBetweenElementClicks", "theSelector", "openHour", "closeHour"],
        function (result) {
            // Set default values if settings are not found in storage
            minPageRefreshInterval = parseInt(result.minPageRefreshInterval) || 10 * 1000;
            maxPageRefreshInterval = parseInt(result.maxPageRefreshInterval) || 20 * 1000;;
            minClickDelay = parseInt(result.minClickDelay) || 1 * 1000;
            maxClickDelay = parseInt(result.maxClickDelay) || 2 * 1000;
            minDelayBetweenElementClicks = parseInt(result.minDelayBetweenElementClicks) || 1 * 1000;;
            maxDelayBetweenElementClicks = parseInt(result.maxDelayBetweenElementClicks) || 2 * 1000;;
            theSelector = result.theSelector || 'div[aria-label="Like"]';
            openHour = parseInt(result.openHour) || 6;
            closeHour = parseInt(result.closeHour) || 23;

            // Log variables for debugging
            console.log("minPageRefreshInterval", minPageRefreshInterval);
            console.log("maxPageRefreshInterval", maxPageRefreshInterval);
            console.log("minClickDelay", minClickDelay);
            console.log("maxClickDelay", maxClickDelay);
            console.log("minDelayBetweenElementClicks", minDelayBetweenElementClicks);
            console.log("maxDelayBetweenElementClicks", maxDelayBetweenElementClicks);
            console.log("theSelector", theSelector);
            console.log("openHour", openHour);
            console.log("closeHour", closeHour);

            configLoaded = true;
            callback();
        }
    );
}

// Function to click on elements matching theSelector
function clickLiketheElement() {
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour >= openHour && currentHour < closeHour) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0 && tabs[0].id) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: () => {
                        const theElements = document.querySelectorAll(theSelector);

                        function getRandomDelay(minDelay, maxDelay) {
                            return Math.random() * (maxDelay - minDelay) + minDelay;
                        }

                        theElements.forEach((theElement, index) => {
                            if (isInViewport(theElement)) {
                                setTimeout(() => {
                                    theElement.click();
                                    console.log(`'${theSelector}' clicked at ${new Date().toLocaleString()}`);
                                }, getRandomDelay(minDelayBetweenElementClicks, maxDelayBetweenElementClicks) * index);
                            }
                        });
                    },
                });
            }
        });
    }
}

// Function to generate a random delay
function getRandomDelay(minDelay, maxDelay) {
    return Math.random() * (maxDelay - minDelay) + minDelay;
}

// Function to refresh the active page at a random interval
function refreshPageWithRandomInterval() {
    refreshPage();
    const randomInterval = getRandomDelay(minPageRefreshInterval, maxPageRefreshInterval);
    clearInterval(refreshIntervalID);
    refreshIntervalID = setInterval(refreshPageWithRandomInterval, randomInterval);
}

// Function to refresh the active page
function refreshPage() {
    if (isExtensionActive) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0 && tabs[0].id) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: () => {
                        location.reload();
                    },
                });
            }
            console.log(`Page is refreshed at ${new Date().toLocaleString()}`);
        });
    }
}

// Function to check if an element is in the viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}

// Function to toggle the extension's state/icon
function toggleExtensionState() {
    isExtensionActive = !isExtensionActive;
    console.log(`Extension state toggled. Extension is now ${isExtensionActive ? "active" : "inactive"} as of ${new Date().toLocaleString()}`);
    clearInterval(refreshIntervalID);
    clearInterval(liketheElementClickIntervalID);
    const newIconPath = isExtensionActive ? "images/icon-active.png" : "images/icon-128.png";
    chrome.action.setIcon({ path: newIconPath });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "clickLiketheElement", isExtensionActive });
    });

    if (isExtensionActive) {
        liketheElementClickIntervalID = setInterval(clickLiketheElement, getRandomDelay(minClickDelay, maxClickDelay));
    }

    if (isExtensionActive) {
        refreshPageWithRandomInterval();
    }
}

// Add a listener for the extension button click event
chrome.action.onClicked.addListener(() => {
    loadConfig(toggleExtensionState);
});

// Check if the extension was previously active and load configuration settings
chrome.storage.local.get("isExtensionActive", (data) => {
    if (data.isExtensionActive) {
        loadConfig(toggleExtensionState);
    } else {
        loadConfig(() => {
            refreshPageWithRandomInterval();
            liketheElementClickIntervalID = setInterval(clickLiketheElement, getRandomDelay(minClickDelay, maxClickDelay));
        });
    }
});
