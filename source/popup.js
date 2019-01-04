var data = {};
chrome.storage.local.get(['courses'], function(storage) {
  data["chrome.storage[courses]"] = storage.courses;
  chrome.runtime.sendMessage({
    sendBack: false,
    id: "canvas_gradebook_get"
  }, function(bg_data) {
    data["bg_data"] = bg_data;
    $("#mytextarea").val(lzjs.compressToBase64(JSON.stringify(data)));
  });
});