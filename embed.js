chrome.runtime.onMessage.addListener(go);

var first = true;
function go(request, sender, sendResponse) {
var s = document.createElement('script');
if(first) {
	s.src = chrome.extension.getURL("index.js");
	first = false;
} else {
	s.src = chrome.extension.getURL('toggle.js');
}
s.onload = function() {
	this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(s);
}


