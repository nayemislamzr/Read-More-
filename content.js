var documentClone = document.cloneNode(true);
var article = new Readability(documentClone).parse();

chrome.storage.local.set({ key: article }, function() {
    console.log('article has been parsed');
});

const reader_html = chrome.extension.getURL("bear.htm");
window.open(reader_html, "_blank");

// $(document).ready(function() {
//     if (isProbablyReaderable(document))
//         console.log("readable");
//     else console.log("not readable");
// });