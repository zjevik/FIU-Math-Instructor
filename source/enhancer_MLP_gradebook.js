var courses;
var mlp_course_id

waitRosterToLoad();

function waitRosterToLoad() {
  if ($(".col-xs-9.text-right").length == 0) {
    setTimeout(function() {
      waitRosterToLoad()
    }, 1500);
  } else {
    setTimeout(function() {
      console.log('Table of students loaded.');
      DOMModificationHandler();
    }, 250);
  }
}

//Handles page changes for recording
function DOMModificationHandler() {
/*  $(this).unbind('DOMSubtreeModified');
  setTimeout(function() {
    rosterLoaded();
    $("#class-roster-container").bind('DOMSubtreeModified', DOMModificationHandler);
  }, 15);
*/
    /*
  var div = document.createElement('div');
  div.style.width = "25%";
  div.style.float = "left";
  btn = document.createElement("button");
  btn.innerText = "Read data for Canvas";
  btn.style.marginRight = "5px";
  btn.style.marginLeft = "5px";
  btn.style.backgroundColor = "antiquewhite";
  btn.type = "button";
  btn.addEventListener('click', function(e) {
    rosterLoaded();
  });
  div.appendChild(btn);
  $(div).insertBefore(".col-xs-9.text-right");
  $(".col-xs-9.text-right").css({'width': '50%'});
  */
}

//Contact parent window for MLP course ID
chrome.runtime.sendMessage({
  id: "transfer"
}, function(response) {
  mlp_course_id = response.mlp_course_id;
});

function rosterLoaded() {
  //Get courses from storage
  chrome.storage.local.get(['courses'], function(storage) {
    courses = storage.courses;
    scoresSaved = 0;

    $.each($("#classRoster tr.ng-scope"), function() {
      //Read data from MLP
      mlp_id = $(this).find("a").attr('href').substring($(this).find("a").attr('href').indexOf("=") + 1)
      score = $(this).find("td")[1].innerText
      if(score.indexOf("%")>0)
        scoresSaved++;

      //Save result for student
      chrome.runtime.sendMessage({
        sendBack: false,
        id: "MLP_gradebook",
        mlp_student_id: mlp_id,
        score: score,
        mlp_course_id: mlp_course_id
      }, function(data) {

      });
    });

    toastr.success("Saved "+scoresSaved+" scores.")
  });
}


toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": false,
  "progressBar": true,
  "positionClass": "toast-bottom-center",
  "preventDuplicates": true,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
