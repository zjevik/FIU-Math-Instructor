var course = {
  id_pid_to_canvasid: {},
  gradebook_save_ids: {}
};
var coursesStorage = [];
var includeMidGrade = false;
var assignmentID;
var midtermIDupdated = [];
var bgData;
var MLPIDfromCanvasID = {};
var addMidtermList = [];
var Rcourse_id_mlpid_to_pid, Rcourse_id_pid_to_canvasid;

course.canvas_id = window.location.pathname.substring(9, 9 + window.location.pathname.substring(9).indexOf('/'));
course.canvas_name = $("title")[0].innerText.substring($("title")[0].innerText.indexOf("-") + 2);

//get stored data
chrome.storage.local.get(['courses'], function(storage) {
  courses = storage.courses;
  if (courses == undefined) {
    courses = [];
  }

  //find the course
  courseFound = false;
  for (var i in courses) {
    strCourse = courses[i];
    if (strCourse.canvas_id == course.canvas_id) {
      courseFound = true;
      course = strCourse;


      console.log("Course found in storage");
    }
  }
  if (courseFound == false) {
    // Course was not found
    courses.push(course);
  }
  coursesStorage = courses;

  //Swap id dictionaries
  Rcourse_id_pid_to_canvasid = swapDict(course["id_pid_to_canvasid"]);
  Rcourse_id_mlpid_to_pid = swapDict(course["id_mlpid_to_pid"]);


});

//add button to all columns
waitForGradebookToLoad()

function swapDict(json) {
  var ret = {};
  for (var key in json) {
    ret[json[key]] = key;
  }
  return ret;
}

function waitForGradebookToLoad() {
  if ($("#search-filter-container").children().prop("disabled") == true) {
    setTimeout(function() {
      waitForGradebookToLoad()
    }, 250);
  } else {
    setTimeout(function() {
      console.log('Gradebook loaded.');
      gradebookLoaded();
    }, 750);
  }
}

function isFloat(val) {
  var floatRegex = /^-?\d+(?:[.,]\d*?)?$/;
  if (!floatRegex.test(val))
    return false;

  val = parseFloat(val);
  if (isNaN(val))
    return false;
  return true;
}

//Get student MLP id from canvas id
function getMLPIDfromCanvasID(canvasID) {
  if (MLPIDfromCanvasID.hasOwnProperty(canvasID)) {
    return MLPIDfromCanvasID[canvasID];
  }
  pid = Rcourse_id_pid_to_canvasid[canvasID];
  MLPid = Rcourse_id_mlpid_to_pid[pid];
  MLPIDfromCanvasID[canvasID] = MLPid;
  return MLPid;
}

//Handles page changes for recording
function DOMModificationHandler() {
  $(this).unbind('DOMSubtreeModified');
  setTimeout(function() {
    update();
    $(".canvas_1.grid-canvas").bind('DOMSubtreeModified', DOMModificationHandler);
  }, 250);
}

//Handles page changes for inputing mid-term grades
function DOMModificationHandlerMidGrade() {
  $(this).unbind('DOMModificationHandlerMidGrade');
  setTimeout(function() {
    //Check whether data are saved
    if (bgData.hasOwnProperty("mlp") && course.hasOwnProperty("mlp_course_id") && bgData["mlp"].hasOwnProperty(course["mlp_course_id"])) {
      $(".assignment_" + assignmentID).each(function(el) {
          //get canvasID
          var row = $(this).closest(".slick-row").attr("class");
          if(row && row.length>0 && row.split(" ").filter(s => s.includes('student')).length>0){
              var canvas_ID = row.split(" ").filter(s => s.includes('student'))[0].substring(8);
              if (!midtermIDupdated.includes(canvas_ID)) {
                  midtermIDupdated.push(canvas_ID);

                  mlp_id = getMLPIDfromCanvasID(canvas_ID);

                  score = bgData["mlp"][course["mlp_course_id"]][mlp_id];

                  // Input the score
                  if (score != undefined) {
                    addMidtermList.push([canvas_ID, assignmentID, score]);
                    //$(this).parent().click();
                    //$("[data-student_id=10775]").last().parent().find("input").val("81.16%")
                    //console.log($(this).parent().find("input"));
                  }
                  if (score == undefined) {
                    toastr.error("MLP score not found. Please go to MLP gradebook and refresh this page.")
                  }
              }
          }
      });
        /* Old code:
      $("a[data-student_id][data-assignment-id='" + assignmentID + "']").each(function(el) {
        //console.log(this);
        canvas_ID = $(this).attr("data-student_id");
        if (!midtermIDupdated.includes(canvas_ID)) {
          midtermIDupdated.push(canvas_ID);

          mlp_id = getMLPIDfromCanvasID(canvas_ID);

          score = bgData["mlp"][course["mlp_course_id"]][mlp_id];

          // Input the score
          if (score != undefined) {
            addMidtermList.push([canvas_ID, assignmentID, score]);
            //$(this).parent().click();
            //$("[data-student_id=10775]").last().parent().find("input").val("81.16%")
            //console.log($(this).parent().find("input"));
          }
          if (score == undefined) {
            toastr.error("MLP score not found. Please go to MLP gradebook and refresh this page.")
          }
        }

        //console.log(score);
      })
      */
    } else if (!course.hasOwnProperty("mlp_course_id")) {
      toastr.error("Need additional information from MLP. Please go to MLP and copy assignment grades from Canvas to MLP and refresh this page.")
    } else {
      toastr.error("No MLP data found. Please go to MLP gradebook and refresh this page.")
    }
  }, 500);
}

//Add midterm Scores
addMidtermScores();

function addMidtermScores() {
  if (addMidtermList.length > 0) {
      item = addMidtermList.shift();
      el = $(".canvas_1 .student_" + item[0] + " .assignment_"+item[1]);
      el.click();
      setTimeout(function() {
          el.parent().find("input").val(item[2])
          document.body.click()
      }, 250);
      setTimeout(function() {
          el.closest(".gradebook-cell").addClass("result_saved");
      }, 350);
    
      /*
    item = addMidtermList.shift();
    el = $("a[data-student_id=" + item[0] + "][data-assignment-id='" + item[1] + "']");
    el.parent().click();
    setTimeout(function() {
      el = $("a[data-student_id=" + item[0] + "][data-assignment-id='" + item[1] + "']");
      el.parent().find("input").val(item[2])
      document.body.click()
    }, 250);
    setTimeout(function() {
      el = $("a[data-student_id=" + item[0] + "][data-assignment-id='" + item[1] + "']");
      el.closest(".gradebook-cell").addClass("result_saved");
    }, 350);
    */
  }
  setTimeout(function() {
    addMidtermScores()
  }, 1000);
}

//Save data back to chrome storage
function storeData() {
  chrome.storage.local.set({
    courses: coursesStorage
  }, function() {
    // Notify that we saved data
    console.log('Settings saved');
  });
}

//read and process data from gradebook
function update() {
  //check every row

  $(".canvas_1.grid-canvas").children().each(function() {
    //console.log(this);
    canvasid = this.classList[this.classList.length-1].substr(8);
    for (var id in course.gradebook_save_ids) {
      //offset between gradebook_save_ids and slick cell
      try {
        class_id = parseInt(id) + 2;
        if ($(this).find(".b" + class_id).length > 0) {
          // cell is displayed
          value = $(this).find(".b" + class_id + " .gradebook-cell")[0].innerText.replace("%", "");


          //save result for student
          if (isFloat(value)) chrome.runtime.sendMessage({
            sendBack: false,
            id: "canvas_gradebook",
            canvas_id: course.canvas_id,
            gradebook_save_id: id,
            result: value,
            canvasid: canvasid,
            element: this
          }, function(data) {
            //console.log(data);
            tmp = parseInt(data.gradebook_save_id) + 2;
            $(".student_" + data.canvasid).closest(".slick-row").find(".b" + tmp + " .gradebook-cell").addClass("result_saved");
          });
        }
      } catch (e) {

      }
    }
  });
}



function gradebookLoaded() {
  $(".slick-header-column").height($(".slick-header-column").height() + 25);
  //add graphical elements to gradebook
  div = document.createElement("div");
  span = document.createElement("span");
  span.style.position = "absolute";
  span.style.marginTop = "6px";
  span.style.marginLeft = "-55px";
  span.innerText = "Save for MLP: ";
  div.appendChild(span);

  label = document.createElement("label");
  label.classList.add("switch");
  input = document.createElement("input");
  input.type = "checkbox";

  span = document.createElement("span");
  span.classList.add("slider");

  label.appendChild(input);
  label.appendChild(span);
  div.appendChild(label);
  $(".slick-header-column").slice(2).append(div);
  var checkboxList = $(".slick-header-column input:checkbox").change(function(e) {
    //console.log(checkboxList.index(this));

    if (course.gradebook_save_ids.hasOwnProperty(checkboxList.index(this))) {
      //Remove the element
      delete course.gradebook_save_ids[checkboxList.index(this)];
    } else {
      //Add the element
      if (this.parentElement.parentElement.parentElement.firstElementChild.firstElementChild == null) {
        course.gradebook_save_ids[checkboxList.index(this)] = this.parentElement.parentElement.parentElement.firstElementChild.innerText;
      } else {
        course.gradebook_save_ids[checkboxList.index(this)] = this.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.innerText;
      }
    }

    storeData();
    update();
  });

  //update checkboxes from storage
  for (var i in course.gradebook_save_ids) {
    checkboxList[i].checked = true;
  }

  //Expand the grid with grades to display bottom row
  $("#gradebook_grid").height($("#gradebook_grid").height() + 25);

  update();
  $(".canvas_1.grid-canvas").bind('DOMSubtreeModified', DOMModificationHandler);

  //Add copy mid-semester grades fom MLP button
  $(".slick-header-column[title='Mid-Semester Grade']").not("[id*='group']").children().not("[class]").remove();
  /*
  $(".slick-header-column[title='Mid-Semester Grade']").not("[id*='group']").each(function() {
    var midgrade = document.createElement("div");
    btn = document.createElement("button");
    btn.innerText = "Copy from MLP";
    btn.addEventListener('click', function(event) {
      event.stopPropagation();
      //get data from background page
      chrome.runtime.sendMessage({
        sendBack: false,
        id: "canvas_gradebook_get"
      }, function(data) {
        bgData = data;
      });

      toastr.info("Copying grades from MLP...")

      //Find how many grades are saved from MLP gradebook
      studentsWithScore = 0;
      

      includeMidGrade = true;
      setTimeout(function() {
        includeMidGrade = false;
      }, 10000)
      fillMLPData(this);
    });
    midgrade.appendChild(btn);
    this.append(midgrade);
  })
  */
}

function fillMLPData(elem) {
  assignmentID = elem.parentElement.parentElement.id.substr(elem.parentElement.parentElement.id.lastIndexOf("_") + 1);
  //console.log(aID);

  DOMModificationHandlerMidGrade();

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
