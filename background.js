//chrome.window.onloadend.addEventListener(function(){
//    
//    console.log("onloadend");
//    
//});

chrome.tabs.onUpdated.addListener(function(tabId , info, tab) {
    if (info.status == "complete") {
        console.log(" tag onUpdated ? " + info.status + " , tabId ? " + tab.id);
        console.log(tab.url);
        
        chrome.tabs.sendMessage(tab.id, {text: 'report_back'}, function(){});
    }
});


function doStuffWithDom(domContent) {
    console.log('I received the following DOM content:\n' + domContent);
}
