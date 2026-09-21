// ===================================================================
// FakeShield Chrome Extension - Background Service Worker
// ===================================================================

chrome.runtime.onInstalled.addListener(() => {
    // 1. Text Selection Context Menu
    chrome.contextMenus.create({
        id: 'fakeShieldAnalyzeText',
        title: '🛡️ Verify Selection with FakeShield',
        contexts: ['selection']
    });

    // 2. Link / URL Context Menu
    chrome.contextMenus.create({
        id: 'fakeShieldAnalyzeLink',
        title: '🔗 Check Link Credibility',
        contexts: ['link', 'page']
    });

    // 3. Image Context Menu
    chrome.contextMenus.create({
        id: 'fakeShieldAnalyzeImage',
        title: '🖼️ Analyze Image with FakeShield',
        contexts: ['image']
    });

    console.log('✅ FakeShield Extension background worker initialized.');
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'fakeShieldAnalyzeText' && info.selectionText) {
        chrome.storage.local.set({ selectedText: info.selectionText }, () => {
            chrome.action.openPopup?.() || chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
        });
    } else if (info.menuItemId === 'fakeShieldAnalyzeLink') {
        const targetUrl = info.linkUrl || info.pageUrl;
        if (targetUrl) {
            chrome.storage.local.set({ selectedUrl: targetUrl }, () => {
                chrome.action.openPopup?.() || chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
            });
        }
    } else if (info.menuItemId === 'fakeShieldAnalyzeImage' && info.srcUrl) {
        chrome.storage.local.set({ selectedImageUrl: info.srcUrl }, () => {
            chrome.action.openPopup?.() || chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
        });
    }
});