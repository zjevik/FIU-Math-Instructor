var course = {
    id_pid_to_canvasid: {},
    gradebook_save_ids: {}
};
var coursesStorage = [];
course.canvas_id = window.location.pathname.substring(9, 9 + window.location.pathname.substring(9).indexOf('/'));
course.canvas_name = $("title")[0].innerText.substring($("title")[0].innerText.indexOf("-") + 2);

//get stored data
chrome.storage.local.get(['courses'], function (storage) {
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
});

//add button to all columns
waitForGradebookToLoad()


function waitForGradebookToLoad() {
    if ($(".gradebook_filter")[0].style.display == "none") {
        setTimeout(function () {
            waitForGradebookToLoad()
        }, 250);
    } else {
        setTimeout(function () {
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

//Handles page changes
function DOMModificationHandler() {
    $(this).unbind('DOMSubtreeModified');
    setTimeout(function () {
        update();
        $(".canvas_1.grid-canvas").bind('DOMSubtreeModified', DOMModificationHandler);
    }, 5);
}

//Save data back to chrome storage
function storeData() {
    chrome.storage.local.set({
        courses: coursesStorage
    }, function () {
        // Notify that we saved data
        console.log('Settings saved');
    });
}

//read and process data from gradebook
function update() {
    //check every row

    $(".canvas_1.grid-canvas").children().each(function () {
        //console.log(this);
        canvasid = $(this).find("[data-user-id]").attr("data-user-id");
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
                    }, function (data) {
                        //console.log(data);
                        tmp = parseInt(data.gradebook_save_id) + 2;
                        $("[data-user-id='" + data.canvasid + "']").closest(".slick-row").find(".b" + tmp + " .gradebook-cell").addClass("result_saved");
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
    var checkboxList = $(".slick-header-column input:checkbox").change(function (e) {
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
    $("#gradebook_grid").height($("#gradebook_grid").height()+25);

    update();
    $(".canvas_1.grid-canvas").bind('DOMSubtreeModified', DOMModificationHandler);

}
