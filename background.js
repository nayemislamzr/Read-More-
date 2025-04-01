// background.js

// marked.min.js is loaded before this script (as per manifest.json),
// so the 'marked' function should be available globally here.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'parseMarkdown' && request.markdown) {
    console.log('Background: Received markdown to parse.');
    try {
      // Check if marked function is available
      if (typeof marked === 'function') {
        const html = marked(request.markdown);
        console.log('Background: Markdown parsed successfully.');
        sendResponse({ status: 'success', html: html });
      } else {
        console.error('Background Error: marked function is not defined!');
        sendResponse({ status: 'error', message: 'Markdown parser not available in background script.' });
      }
    } catch (error) {
      console.error('Background Error parsing markdown:', error);
      sendResponse({ status: 'error', message: `Error parsing Markdown: ${error.message}` });
    }
    // Return true to indicate you wish to send a response asynchronously
    // (although in this case, parsing is synchronous, it's good practice)
    return true;
  }
});

console.log("Background script loaded."); // For debugging
