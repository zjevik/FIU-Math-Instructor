var data = {
    // PantherSoft data
    panther: {},

    // {canvas_id: {assignmentID: result, assignmentID: result, ...}}
    canvas: {}
};
var clipboardContents = "";

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    //console.log(message)
    if (message.sendBack) {
        chrome.tabs.sendMessage(sender.tab.id, data);
    }

    switch (message.id) {
        case "panthersoft":
            data.panther[message.className] = message.data;
            sendResponse(true);
            break;
        case "MLP_studentID":
            sendResponse(data);
            break;
        case "canvas_gradebook":
            //Create class in data.canvas if not there
            if (!data.canvas.hasOwnProperty(message.canvas_id)) {
                data.canvas[message.canvas_id] = {};
            }
            //Create student in data.canvas[message.canvas_id] if not there
            if (!data.canvas[message.canvas_id].hasOwnProperty(message.canvasid)) {
                data.canvas[message.canvas_id][message.canvasid] = {};
            }
            //Create/update assignment result in data.canvas[message.canvas_id][message.canvasid]
            data.canvas[message.canvas_id][message.canvasid][message.gradebook_save_id] = message.result;

            sendResponse(message)
            break;
        case "MLP_assignment":
            sendResponse(data.canvas[message.canvas_id]);
            break;
        case "MLP_assignment_clipboard":
            newClipboardContents = getClipboard();

            if (newClipboardContents != clipboardContents) {
                clipboardContents = newClipboardContents;
                // proccess the clipboard and return student list
                rows = clipboardContents.split("\n");
                clipData = {};
                rows.forEach(function(item) {
                    els = item.split("\t");
                    clipData[els[0]] = els[els.length - 1];
                });
                sendResponse(clipData);
            }
            break;
    }

    //console.log("DATA:")
    //console.log(data)
    return true;
});

function getClipboard() {
    var pasteTarget = document.createElement("div");
    pasteTarget.contentEditable = true;
    var actElem = document.activeElement.appendChild(pasteTarget).parentNode;
    pasteTarget.focus();
    document.execCommand("Paste", null, null);
    var paste = pasteTarget.innerText;
    actElem.removeChild(pasteTarget);
    return paste;
};
