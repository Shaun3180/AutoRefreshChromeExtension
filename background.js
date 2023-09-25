let isExtensionActive = false;
let refreshIntervalID; // Store the interval ID for page refresh
let likeButtonClickIntervalID; // Store the interval ID for like button clicking

// Function to load the options from Chrome's storage
function loadOptions() {
    chrome.storage.local.get(["minRefreshInterval", "maxRefreshInterval", "minClickDelay", "maxClickDelay", "theSelector"], (result) => {
        const minRefreshInterval = result.minRefreshInterval || 10000; // Default to 10 seconds in milliseconds
        const maxRefreshInterval = result.maxRefreshInterval || 20000; // Default to 90 seconds in milliseconds
        const minClickDelay = result.minClickDelay || 1000; // Default to 3 seconds in milliseconds
        const maxClickDelay = result.maxClickDelay || 2000; // Default to 10 seconds in milliseconds
        const theSelector = result.theSelector || 'div[aria-label="Like"]'; // Default selector

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
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: () => {
                        const likeButtons = document.querySelectorAll('div[aria-label="Like"]');
                        for (const button of likeButtons) {
                            if (isInViewport(button)) {
                                button.click();

                                // Display the date and time when the button was clicked
                                const clickedTime = new Date().toLocaleString();
                                console.log("Clicked at:", clickedTime);
                            }
                        }
                    },
                });
            });
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
        // Function to toggle the extension's state
        function toggleExtensionState() {
            isExtensionActive = !isExtensionActive;

            // Store the extension's state in chrome.storage.local
            chrome.storage.local.set({ isExtensionActive }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error storing extension state:", chrome.runtime.lastError);
                    return;
                }

                // Change the icon based on the extension's state
                const newIconPath = isExtensionActive ? "images/icon-active.png" : "images/icon-128.png";

                chrome.action.setIcon({ path: newIconPath });

                // Send a message to the content script to toggle the extension state
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    // Change the action to 'clickLikeButton'
                    chrome.tabs.sendMessage(tabs[0].id, { action: "clickLikeButton", isExtensionActive });
                });

                // Clear the like button clicking interval regardless of whether the extension is active or not
                clearInterval(likeButtonClickIntervalID);

                // If extension is enabled, set up a new interval for like button clicking
                if (isExtensionActive) {
                    likeButtonClickIntervalID = setInterval(clickLikeButton, getRandomDelay(minClickDelay, maxClickDelay));
                }
            });
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
                likeButtonClickIntervalID = setInterval(clickLikeButton, getRandomDelay(minClickDelay, maxClickDelay));
            }
        });
    });
}

// Call the function to load options when the extension starts
loadOptions();
