// Listen for a message from the popup script to extract text content
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getTextContent") {
        console.log("Content script received getTextContent request.");
        // Attempt to extract meaningful text content.
        // Using innerText is a basic approach; more sophisticated methods exist.
        // Consider trying to find the main content area first if possible.
        let mainContent = document.body.innerText; // Basic extraction

        // Optional: Try a slightly more targeted approach (example)
        const mainElement = document.querySelector('main') || document.querySelector('article') || document.body;
        if (mainElement) {
            mainContent = mainElement.innerText;
        }

        if (mainContent) {
            console.log("Extracted text content, sending back to popup.");
            sendResponse({ status: "success", textContent: mainContent });
        } else {
            console.error("Content script failed to extract text content.");
            sendResponse({ status: "error", message: "Could not extract text content from the page." });
        }
        // Keep the message channel open for the asynchronous response (optional but good practice)
        return true;
    }
});

// Note: The Readability library (html_parser.js) and jQuery are still loaded
// according to manifest.json but are not used in this simplified version.
// They could be removed from manifest.json if no longer needed.
