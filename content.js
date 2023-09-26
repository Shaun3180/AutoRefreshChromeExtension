// Hard-coded selector
const theSelector = 'div[aria-label="Like"]'; // Default selector
const likeButtons = document.querySelectorAll(theSelector);
const minDelayBetweenElementClicks = 10 * 1000; // if there are multiple matching elements on the page, the min delay between clicks
const maxDelayBetweenElementClicks = 100 * 1000; // if there are multiple matching elements on the page, the min delay between clicks

// Function to find and click the 'Like' button
function clickLikeButton() {
    function getRandomDelay(minDelay, maxDelay) {
        return Math.random() * (maxDelay - minDelay) + minDelay;
    }

    likeButtons.forEach((button, index) => {
        if (isInViewport(button)) {
            setTimeout(() => {
                button.click();

                // Display the iteration and theSelector when the button was clicked
                console.log(`'${theSelector}' clicked at ${new Date().toLocaleString()}`);
            }, getRandomDelay(minDelayBetweenElementClicks, maxDelayBetweenElementClicks) * index); // Random delay between 3-5 seconds
        }
    });
}

// Function to check if an element is in the viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "clickLikeButton") {
        // Call the clickLikeButton function when a message is received
        clickLikeButton();
    }
});
