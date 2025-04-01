const componants = {
    checkbox: document.querySelector("input#checkbox"),
    slider: document.querySelector("span[class='slider round']"),
    header: document.querySelector("header"),
    logo: document.querySelectorAll("img.logo"),
    statusMessage: document.createElement('p') // Element to show status/errors
}

// Add status message area to the popup
componants.statusMessage.style.padding = '5px';
componants.statusMessage.style.textAlign = 'center';
componants.header.insertAdjacentElement('afterend', componants.statusMessage);

const API_KEY = "AIzaSyDK7aM1aMTUSszXvUa8LIuzkBsQyi1_5kk"; // Your provided API key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

// Function to display status/errors in the popup
function showStatus(message, isError = false) {
    componants.statusMessage.textContent = message;
    componants.statusMessage.style.color = isError ? 'red' : 'black';
    console.log(`Popup Status: ${message}`);
}

// Function to call Gemini API - requesting PLAIN TEXT output
async function processWithGemini(text) {
    showStatus("Processing text with Gemini...");
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        // Updated prompt: Ask for plain text, explicitly avoiding Markdown.
                        text: `Please rewrite the *entire* following text as PLAIN TEXT to improve its readability. Use simpler sentence structures and clearer vocabulary. Add paragraph breaks (double newlines) where appropriate. Do NOT use any Markdown formatting (like **, *, #, -, lists, etc.). Preserve all the original information:\n\n${text}`
                    }]
                }],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API Error Response:", errorData);
            throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            showStatus("Gemini processing successful.");
            // Return the plain text directly
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error("Unexpected Gemini API response structure:", data);
            throw new Error("Could not extract processed text from Gemini response.");
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        showStatus(`Error: ${error.message}`, true);
        return null;
    }
}

// Function to save plain text and open reader tab
function saveTextAndOpen(plainText) {
    // Use a new key for plain text content
    const storageKeyText = 'readerContentText';
    chrome.storage.local.set({ [storageKeyText]: plainText }, function() {
        if (chrome.runtime.lastError) {
            showStatus(`Error saving text: ${chrome.runtime.lastError.message}`, true);
        } else {
            showStatus("Processed text saved.");
            // Open the reader view tab
            const reader_html_url = chrome.runtime.getURL("bear.htm");
            window.open(reader_html_url, "_blank");
            // Optionally close the popup
            // window.close();
        }
    });
}


// Main logic when the switch is toggled
async function handleSwitchChange(event) {
    if (event.target.checked) {
        // Update UI
        componants.header.style.backgroundColor = "var(--header-clicked)";
        for (let node of componants.logo) {
            node.style.backgroundImage = "linear-gradient( #4ceadb 50% , var(--header-clicked) 50%)";
        }
        showStatus("Requesting page content...");

        // Request text content from the active tab's content script
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "getTextContent" }, async function(response) {
                    if (chrome.runtime.lastError) {
                        showStatus(`Error getting content: ${chrome.runtime.lastError.message}`, true);
                        return;
                    }
                    if (response && response.status === "success" && response.textContent) {
                        showStatus("Content received, processing...");
                        // Process with Gemini (expecting plain text)
                        const plainText = await processWithGemini(response.textContent);

                        if (plainText !== null) { // Check for null in case of Gemini error
                           saveTextAndOpen(plainText);
                        }
                        // Error handling for Gemini is done within processWithGemini
                    } else {
                        showStatus(`Error getting content: ${response?.message || 'Failed to get content.'}`, true);
                    }
                });
            } else {
                showStatus("Error: Could not find active tab.", true);
            }
        });

    } else {
        // Revert UI changes when unchecked
        componants.header.style.backgroundColor = "var(--header-not-clicked)";
        for (let node of componants.logo) {
            node.style.backgroundImage = "linear-gradient(#f70e7a 50%,#e91a7b 50%)";
        }
        showStatus(""); // Clear status message
    }
}

// Add event listener
componants.checkbox.addEventListener("change", handleSwitchChange, false);

// Initial UI state based on checkbox (optional)
// handleSwitchChange({ target: componants.checkbox }); // Uncomment to set initial style
