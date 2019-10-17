var course = {
    id_pid_to_canvasid: {},
    gradebook_save_ids: {}
};

function unique(arr) {
    var u = {},
        a = [];
    for (var i = 0, l = arr.length; i < l; ++i) {
        if (!u.hasOwnProperty(arr[i])) {
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
}

//Handles page changes
function DOMModificationHandler() {
    $(this).unbind('DOMSubtreeModified');
    setTimeout(function () {
        readData();
        $("div[data-view='users']").bind('DOMSubtreeModified', DOMModificationHandler);
    }, 5);
}

//Stores data to chrome storage
function storeData() {
    chrome.storage.local.get(['courses'], function (storage) {
        courses = storage.courses;
        if (courses == undefined) {
            courses = [];
        }

        //console.log(courses);

        //find the course
        courseFound = false;
        for (var i in courses) {
            strCourse = courses[i];
            if (strCourse.canvas_id == course.canvas_id) {
                courseFound = true;
                // Course found! Replace/add user ids
                added = 0;
                for (var j in course.id_pid_to_canvasid) {
                    if (!strCourse.id_pid_to_canvasid.hasOwnProperty(j)) {
                        strCourse.id_pid_to_canvasid[j] = course.id_pid_to_canvasid[j];
                        added++;
                    }
                }

                //console.log(added);
            }
        }
        if (courseFound == false) {
            // Course was not found
            courses.push(course);
        }

        //console.log(courses);

        //Save data back
        chrome.storage.local.set({
            courses: courses
        }, function () {
            // Notify that we saved data
            //console.log('Settings saved');

        });
    });
}

//read data from page
function readData() {
    var colWitPID = null;
    for(var i in $("div[data-view='users'] thead th")){
        if($("div[data-view='users'] thead th")[i].innerText == "SIS ID"){
            colWitPID = i;
            break;
        }
    }
    for (var i in $("div[data-view='users'] .rosterUser")) {
        row = $("div[data-view='users'] .rosterUser")[i];

        try {

            pid = row.children[colWitPID].innerText.trim();
            canvasid = row.getAttribute("id").substring(row.getAttribute("id").indexOf('_') + 1);
            if (canvasid == "undefined") {
                console.log(row);
            }

            if (!course.id_pid_to_canvasid.hasOwnProperty(pid)) {
                course.id_pid_to_canvasid[pid] = canvasid;
            }
        } catch (e) {

        }
    }

    console.log(course);

    notification.textContent = 'Data stored for '+Object.keys(course.id_pid_to_canvasid).length+' users';

    storeData();
}

//after each load
$("div[data-view='users']").bind('DOMSubtreeModified', DOMModificationHandler);


course.canvas_name = $("title")[0].innerText.substring($("title")[0].innerText.indexOf(":") + 2);
course.canvas_id = window.location.pathname.substring(9, 9 + window.location.pathname.substring(9).indexOf('/'));


var div = document.createElement('div');
div.style.textAlign = "center";
div.style.fontSize = "x-large";
div.style.backgroundColor = "lightsalmon";

var notification = document.createElement("span");
notification.id = "z_notification";

div.appendChild(notification);
$("#tab-0").prepend(div);
