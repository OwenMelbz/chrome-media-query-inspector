chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type){
        case 'DISABLED':
            chrome.browserAction.setBadgeText({
                text: '',
            })
            break;
        case 'SCREEN_CHANGED':
            if (message.data.label && message.data.value) {
                chrome.browserAction.setBadgeText({
                    text: message.data.label,
                })
            }
            break;
        case 'CONFIG_UPDATED':
            chrome.tabs.query({
                currentWindow: true,
                active: true
            }, function(tabs) {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, message);
                })
            });
            break;
    }
})

chrome.browserAction.setBadgeBackgroundColor({
    color: '#d9a9ff',
})
