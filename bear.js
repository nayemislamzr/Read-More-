document.addEventListener('DOMContentLoaded', function() {
    const articleContainer = document.querySelector('.article');
    const storageKeyText = 'readerContentText';

    if (!articleContainer) {
        console.error("Bear.js Error: Could not find the '.article' container element in bear.htm.");
        document.body.innerHTML = '<p style="color: red; padding: 20px;">Error: Reader view structure is broken. Could not find content area.</p>';
        return;
    }

    // Make the article container editable for execCommand
    articleContainer.contentEditable = true;
    articleContainer.style.outline = 'none'; // Hide the focus outline

    // Retrieve the plain text content from local storage
    chrome.storage.local.get([storageKeyText], function(result) {
        if (chrome.runtime.lastError) {
            console.error("Bear.js Error retrieving text from storage:", chrome.runtime.lastError);
            articleContainer.innerText = `Error loading content: ${chrome.runtime.lastError.message}`;
        } else if (result && result[storageKeyText]) {
            console.log("Bear.js: Plain text content retrieved from storage.");
            // Display the plain text content, creating paragraphs
            const paragraphs = result[storageKeyText].split('\n\n');
            articleContainer.innerHTML = ''; // Clear existing content
            paragraphs.forEach(pText => {
                if (pText.trim()) {
                    const pElement = document.createElement('p');
                    pElement.innerText = pText;
                    articleContainer.appendChild(pElement);
                }
            });
            // Apply initial styles from controls after content is loaded
            applyInitialStyles();
        } else {
            console.warn("Bear.js: No text content found in storage for key:", storageKeyText);
            articleContainer.innerText = 'No content was processed or found. Try activating the extension on a page again.';
        }
    });

    // --- Setup UI Controls ---
    // setupFormattingButtons(); // Removed as the buttons are gone
    setupControlListeners(); // For sliders in font controls
    setupThemeSelectors(); // For preference panel
    setupNavbarListeners(); // Add listener setup for the new navbar
    loadThemePreference(); // Load saved theme preference on start
    // etc.
});

// --- Formatting Buttons --- (Removed as buttons are gone)
/*
function setupFormattingButtons() { ... }
*/

// --- Control Sliders and Selectors ---
function applyInitialStyles() {
    // Apply styles based on the initial values of sliders/selectors
    const widthSlider = document.getElementById('controlwidth');
    const lineHeightSlider = document.getElementById('controllineheight');
    const letterSpaceSlider = document.getElementById('controlletterspace');
    const fontSizeSlider = document.getElementById('controlfontsize');
    const articleContainer = document.querySelector('.article');

    if (articleContainer) {
        if (widthSlider) updateStyle('width', widthSlider.value);
        if (lineHeightSlider) updateStyle('lineHeight', lineHeightSlider.value);
        if (letterSpaceSlider) updateStyle('letterSpacing', letterSpaceSlider.value);
        if (fontSizeSlider) updateStyle('fontSize', fontSizeSlider.value);
        // Apply theme/font/color initial values if needed
    }
}

function updateStyle(styleProp, value) {
    const articleContainer = document.querySelector('.article');
    const valueDisplay = document.getElementById(`${styleProp.toLowerCase()}value`); // e.g., controlfontsizevalue

    if (!articleContainer) return;

    let cssValue = value;
    let displayValue = value;

    switch (styleProp) {
        case 'width':
            // Assuming value 0-20 maps to a reasonable width range, e.g., 40% to 100%?
            // This needs refinement based on desired behavior. Example:
            cssValue = `${40 + (value * 3)}%`; // Example mapping
            displayValue = value; // Keep slider value for display
            articleContainer.style.maxWidth = cssValue;
            break;
        case 'lineHeight':
            cssValue = value; // Direct value
            articleContainer.style.lineHeight = cssValue;
            break;
        case 'letterSpacing':
            cssValue = `${value}px`; // Assuming value is in pixels
            articleContainer.style.letterSpacing = cssValue;
            break;
        case 'fontSize':
            cssValue = `${value}px`; // Assuming value is in pixels
            articleContainer.style.fontSize = cssValue;
            break;
        // Add cases for theme, font, color if they directly set styles
        default:
            console.warn("Unknown style property:", styleProp);
            return;
    }

    if (valueDisplay) {
        // Update the text display (e.g., "Font-Size : 16")
        const baseText = valueDisplay.textContent.split(':')[0];
        valueDisplay.textContent = `${baseText}: ${displayValue}`;
    }
     console.log(`Applied style: ${styleProp} = ${cssValue}`);
}


function setupControlListeners() {
    console.log("Setting up control listeners...");
    const sliders = [
        { id: 'controlwidth', style: 'width' },
        { id: 'controllineheight', style: 'lineHeight' },
        { id: 'controlletterspace', style: 'letterSpacing' },
        { id: 'controlfontsize', style: 'fontSize' }
    ];

    sliders.forEach(item => {
        const slider = document.getElementById(item.id);
        if (slider) {
            slider.addEventListener('input', (e) => {
                updateStyle(item.style, e.target.value);
            });
            // Set initial display value based on slider's default value
             const valueDisplay = document.getElementById(`${item.id}value`);
             if (valueDisplay) {
                 const baseText = valueDisplay.textContent.split(':')[0];
                 valueDisplay.textContent = `${baseText}: ${slider.value}`;
             }
        } else {
            console.warn(`Slider with ID ${item.id} not found.`);
        }
    });
}

function setupThemeSelectors() {
    console.log("Setting up theme selectors...");
    const themeSelector = document.getElementById('theme_selector');
    const fontSelector = document.getElementById('font_selector');
    const fontColorSelector = document.getElementById('font_color_selector');
    const backgroundSelector = document.getElementById('background_selector');
    const articleContainer = document.querySelector('.article'); // Or maybe apply to body?

    // Theme selector
    if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            console.log(`Theme selected via dropdown: ${selectedTheme}`);
            applyTheme(selectedTheme); // Apply the theme
            // Save preference
            chrome.storage.local.set({ [THEME_STORAGE_KEY]: selectedTheme }, () => {
                console.log(`Theme preference saved: ${selectedTheme}`);
            });
            // Sync the dark mode toggle if a dark theme is selected/deselected
            const navDarkModeToggle = document.getElementById('checkbox');
            if (navDarkModeToggle) {
                // Check if the selected theme is considered a "dark" theme for the toggle's state
                // Using DARK_THEME_NAME as the reference for now, could be expanded
                navDarkModeToggle.checked = (selectedTheme === DARK_THEME_NAME);
            }
        });
        // Initial theme is applied in loadThemePreference
    }

    // Example: Font selector
    if (fontSelector && articleContainer) {
        fontSelector.addEventListener('change', (e) => {
            console.log(`Font changed to: ${e.target.value}`);
            articleContainer.style.fontFamily = e.target.value; // Assuming value is a valid font-family string
        });
        // Apply initial font
        // articleContainer.style.fontFamily = fontSelector.value;
    }

     // Example: Font color selector
    if (fontColorSelector && articleContainer) {
        fontColorSelector.addEventListener('change', (e) => {
            console.log(`Font color changed to: ${e.target.value}`);
            articleContainer.style.color = e.target.value; // Assuming value is a valid color string
        });
         // Apply initial color
        // articleContainer.style.color = fontColorSelector.value;
    }

     // Example: Background color selector
    if (backgroundSelector && articleContainer) { // Or apply to body?
        backgroundSelector.addEventListener('change', (e) => {
            console.log(`Background changed to: ${e.target.value}`);
            articleContainer.style.backgroundColor = e.target.value; // Assuming value is a valid color string
        });
        // Apply initial background
        // articleContainer.style.backgroundColor = backgroundSelector.value;
    }
}

// --- Navbar Functionality ---

function setupNavbarListeners() {
    console.log("Setting up Navbar listeners...");
    // Navbar Toggles
    // Navbar Toggles
    const navToggleMenu = document.getElementById('nav-toggle-menu');
    const navTogglePrefs = document.getElementById('nav-toggle-prefs');
    const navToggleFontControls = document.getElementById('nav-toggle-font-controls');
    // const navToggleSettings = document.getElementById('nav-toggle-settings'); // Removed
    const navToggleHighlight = document.getElementById('nav-toggle-highlight');
    const navToggleUnderline = document.getElementById('nav-toggle-underline');
    const navDarkModeToggle = document.getElementById('checkbox'); // The actual checkbox

    // Search Elements
    const searchQuerySubmit = document.getElementById('searchQuerySubmit');
    const searchQueryInput = document.getElementById('searchQueryInput');

    // Panels
    // Panels
    const sideMenu = document.querySelector('.side_menu');
    const prefsContainer = document.querySelector('.preference-container');
    const fontControlsContainer = document.getElementById('font-controls-container');
    // const settingsContainer = document.getElementById('settings-container'); // Removed
    const articleContainer = document.querySelector('.article'); // Needed for mouseup listener

    // Mode State
    let isHighlightModeActive = false;
    let isUnderlineModeActive = false;
    const highlightColor = 'yellow'; // Defined earlier, ensure consistency

    // Toggle Side Menu (Head Topics)
    if (navToggleMenu && sideMenu) {
        navToggleMenu.addEventListener('click', () => {
            sideMenu.classList.toggle('visible');
            console.log("Side menu toggled");
            // Close other panels
            prefsContainer?.classList.remove('visible');
            fontControlsContainer?.classList.remove('visible');
            // settingsContainer?.classList.remove('visible'); // Removed
        });
        // Listener for the close button inside the side menu
        const closeHeadContent = document.getElementById('close_head_content');
         if(closeHeadContent) {
             closeHeadContent.addEventListener('click', () => {
                 sideMenu.classList.remove('visible');
                 console.log("Side menu closed via button");
             });
         }
    } else {
        console.warn("Navbar Menu Toggle or Side Menu element not found.");
    }

    // Toggle Preferences Panel
    if (navTogglePrefs && prefsContainer) {
        navTogglePrefs.addEventListener('click', () => {
            prefsContainer.classList.toggle('visible');
            console.log("Preferences panel toggled");
            // Close other panels
            sideMenu?.classList.remove('visible');
            fontControlsContainer?.classList.remove('visible');
            // settingsContainer?.classList.remove('visible'); // Removed
        });
    } else {
        console.warn("Navbar Prefs Toggle or Preferences Container element not found.");
    }

     // Toggle Font Controls Panel
    if (navToggleFontControls && fontControlsContainer) {
        navToggleFontControls.addEventListener('click', () => {
            fontControlsContainer.classList.toggle('visible');
            console.log("Font controls panel toggled");
            // Close other panels
            sideMenu?.classList.remove('visible');
            prefsContainer?.classList.remove('visible');
            // settingsContainer?.classList.remove('visible'); // Removed
        });
    } else {
        console.warn("Navbar Font Controls Toggle or Font Controls Container element not found.");
    }

    // Toggle Settings Panel - Removed
    /*
    if (navToggleSettings && settingsContainer) { ... }
    */

    // Toggle Highlight Mode
    if (navToggleHighlight) {
        navToggleHighlight.addEventListener('click', () => {
            isHighlightModeActive = !isHighlightModeActive;
            navToggleHighlight.classList.toggle('active-mode', isHighlightModeActive);
            console.log(`Highlight mode: ${isHighlightModeActive}`);
            // Deactivate other modes
            if (isHighlightModeActive && isUnderlineModeActive) {
                isUnderlineModeActive = false;
                navToggleUnderline?.classList.remove('active-mode');
            }
        });
    } else {
        console.warn("Navbar Highlight Toggle element not found.");
    }

    // Toggle Underline Mode
    if (navToggleUnderline) {
        navToggleUnderline.addEventListener('click', () => {
            isUnderlineModeActive = !isUnderlineModeActive;
            navToggleUnderline.classList.toggle('active-mode', isUnderlineModeActive);
            console.log(`Underline mode: ${isUnderlineModeActive}`);
             // Deactivate other modes
            if (isUnderlineModeActive && isHighlightModeActive) {
                isHighlightModeActive = false;
                navToggleHighlight?.classList.remove('active-mode');
            }
        });
    } else {
        console.warn("Navbar Underline Toggle element not found.");
    }

    // Dark Mode Toggle
    if (navDarkModeToggle) {
        navDarkModeToggle.addEventListener('change', (e) => {
            toggleTheme(e.target.checked);
        });
    } else {
         console.warn("Dark mode checkbox not found.");
    }

     // Apply formatting on text selection if a mode is active
    if (articleContainer) {
        articleContainer.addEventListener('mouseup', () => {
            const selection = window.getSelection();
            if (selection && !selection.isCollapsed) { // Check if text is selected
                if (isHighlightModeActive) {
                    document.execCommand('hiliteColor', false, highlightColor);
                    console.log("Highlight applied via mode");
                } else if (isUnderlineModeActive) {
                    document.execCommand('underline', false, null);
                    console.log("Underline applied via mode");
                }
            }
        });
    }


    // Search Functionality (Basic In-Page Find)
    if (searchQuerySubmit && searchQueryInput) {
        const performSearch = () => {
            const query = searchQueryInput.value;
            if (query) {
                // Clear previous highlights (simple approach)
                // More robust highlighting would require marking/unmarking ranges
                window.find(query); // Basic browser find
                console.log(`Searching for: ${query}`);
            }
        };

        searchQuerySubmit.addEventListener('click', performSearch);
        searchQueryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    } else {
        console.warn("Search input or submit button not found.");
    }
}

// --- Theme Handling ---
const THEME_STORAGE_KEY = 'bearReaderTheme';
const DARK_THEME_NAME = 'firefox_dark'; // Or choose another default dark theme

function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName || ''); // Ensure empty string if null/undefined
    console.log(`Theme applied: ${themeName}`);
}

function toggleTheme(isDarkMode) {
    // This function is triggered by the dark mode *switch*
    const themeToApply = isDarkMode ? DARK_THEME_NAME : ''; // Use the predefined dark theme or default light
    applyTheme(themeToApply);
    // Save preference
    chrome.storage.local.set({ [THEME_STORAGE_KEY]: themeToApply }, () => {
        console.log(`Theme preference saved: ${themeToApply}`);
    });
    // Update the theme selector dropdown to match
    const themeSelector = document.getElementById('theme_selector');
    if (themeSelector) {
        themeSelector.value = themeToApply;
    }
}

function loadThemePreference() {
    chrome.storage.local.get([THEME_STORAGE_KEY], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error loading theme preference:", chrome.runtime.lastError);
            return;
        }
        const savedTheme = result[THEME_STORAGE_KEY];
        if (savedTheme !== undefined) { // Check if a value was actually saved
             console.log(`Loaded theme preference: ${savedTheme}`);
             applyTheme(savedTheme);
             // Update the checkbox state
             const navDarkModeToggle = document.getElementById('checkbox');
             if (navDarkModeToggle) {
                 // Check if the saved theme is considered dark for the toggle state
                 navDarkModeToggle.checked = (savedTheme === DARK_THEME_NAME); // Adjust if more dark themes are added
             }
             // Update the theme selector dropdown
             const themeSelector = document.getElementById('theme_selector');
             if (themeSelector) {
                 themeSelector.value = savedTheme;
             }
        } else {
            console.log("No saved theme preference found, using default.");
            // Optionally apply a default theme here if needed
             applyTheme(''); // Ensure default theme is applied
        }
    });
}


// --- End of placeholder functions ---
