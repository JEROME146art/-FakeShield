console.log('🛡️ FakeShield Extension loaded on:', window.location.href);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelectedText') {
        const selectedText = window.getSelection().toString();
        sendResponse({ text: selectedText });
    }
});