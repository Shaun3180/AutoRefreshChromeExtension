const theSelector = 'div[aria-label="Like"]';

// Function to toggle the 'Like' button
function clickLikeButton() {
    const likeButtons = document.querySelectorAll(theSelector);
    for (const button of likeButtons) {
        // Click the 'Like' button found in the viewport
        button.click();

        // Display the date and time when the button was clicked in the console
        //const clickedTime = new Date().toLocaleString();
        //console.log('Clicked at:', clickedTime);
    }
}

// Listen for messages with the action 'clickLikeButton'
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'clickLikeButton') {
    // Call the clickLikeButton function when a message is received
    clickLikeButton();
  }
});
