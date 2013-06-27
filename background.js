
/* Show pageAction if is a github / edit page */
function checkUrl(tabId, changeInfo, tab) {
	if(/spot/.exec(tab.url)) {
		chrome.pageAction.show(tabId);
	}
}

chrome.tabs.onUpdated.addListener(checkUrl);

/* When clicked, send a message to the content script */
chrome.pageAction.onClicked.addListener(function(tab) {
	chrome.tabs.sendMessage(tab.id,'go!', function(res) { console.log(res);});
});
