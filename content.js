// Function to find and click the 'Like' button
function clickLikeButton() {
  const likeButtons = document.querySelectorAll('div[aria-label="Like"]');
  for (const button of likeButtons) {
    if (isInViewport(button)) {
      // Click the 'Like' button found in the viewport
      button.click();

      // Display the date and time when the button was clicked
      const clickedTime = new Date().toLocaleString();
      console.log('Clicked at:', clickedTime);
    }
  }
}

// Function to check if an element is in the viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'clickLikeButton') {
    // Call the clickLikeButton function when a message is received
    clickLikeButton();
  }
});

