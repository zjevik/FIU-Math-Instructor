var data = {
  // PantherSoft data
  panther: {},

  // {canvas_id: {assignmentID: result, assignmentID: result, ...}}
  canvas: {},

  // {mlp_class_id: {mlp_student_id: overall_score, mlp_student_id: overall_score,...}}
  mlp: {}
};
var clipboardContents = "";

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
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
    case "canvas_gradebook_get":
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
    case "MLP_gradebook":
      //Create class in data.mlp if not there
      if (!data.mlp.hasOwnProperty(message.mlp_course_id)) {
        data.mlp[message.mlp_course_id] = {};
      }
      //Create/update student overall score in data.mlp[message.mlp_course_id] if not there
      data.mlp[message.mlp_course_id][message.mlp_student_id] = message.score;

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
    case "transfer":
      chrome.tabs.sendMessage(sender.tab.id, "placeholder", function(response) {
        //console.log(response);
        sendResponse(response);
      });
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