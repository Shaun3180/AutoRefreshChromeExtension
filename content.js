let theSelector; // Stores the CSS selector for the elements to be clicked
let minDelayBetweenElementClicks; // Minimum delay between element clicks
let maxDelayBetweenElementClicks; // Maximum delay between element clicks

// Load configuration settings from storage
chrome.storage.sync.get(["theSelector", "minDelayBetweenElementClicks", "maxDelayBetweenElementClicks"], (result) => {
    theSelector = result.theSelector; // Default selector if not found in storage
    minDelayBetweenElementClicks = result.minDelayBetweenElementClicks; // Default minimum delay
    maxDelayBetweenElementClicks = result.maxDelayBetweenElementClicks; // Default maximum delay
});

// Function to click like buttons on the page
function clickLikeButton() {
    const likeButtons = document.querySelectorAll(theSelector); // Find all elements matching the selector

    function getRandomDelay(minDelay, maxDelay) {
        return Math.random() * (maxDelay - minDelay) + minDelay; // Generate a random delay within the specified range
    }

    likeButtons.forEach((button, index) => {
        if (isInViewport(button)) { // Check if the element is in the viewport
            setTimeout(() => {
                button.click(); // Click the element
                console.log(`'${theSelector}' clicked at ${new Date().toLocaleString()}`);
            }, getRandomDelay(minDelayBetweenElementClicks, maxDelayBetweenElementClicks) * index); // Apply a random delay
        }
    });
}

// Function to check if an element is in the viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}

// Listen for messages from the extension popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "clickLikeButton") {
        clickLikeButton(); // Trigger the clickLikeButton function when a message is received
    }
});
