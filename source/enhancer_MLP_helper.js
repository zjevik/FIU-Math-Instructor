chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var tmp = window.location.search;
    tmp = tmp.substr(1+tmp.indexOf("="),tmp.indexOf("&")-tmp.indexOf("=")-1);
    sendResponse({
        mlp_course_id: tmp
    })
    //chrome.runtime.sendMessage({sendBack:true, request:"1,2,3,4,,"});
});