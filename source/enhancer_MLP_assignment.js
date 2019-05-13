var courses;
var courses_actIndex = 0;
var backData;
var clpbData = {};

waitTableStudentsToLoad();
refreshNotification();

function waitTableStudentsToLoad() {
    if ($("#TableStudents").length == 0) {
        setTimeout(function () {
            waitTableStudentsToLoad()
        }, 1500);
    } else {
        setTimeout(function () {
            console.log('Table of students loaded.');
            tableLoaded();
        }, 250);
    }
}

function refreshNotification() {

    setTimeout(function () {
        refreshPrediction();
        refreshNotification();
    }, 1000);
}

function tableLoaded() {
    $(div).insertBefore($("#TableStudents"));

    //get courses from storage
    chrome.storage.local.get(['courses'], function (storage) {
        courses = storage.courses;

        $('#selectedClass').empty();
        $.each(courses, function (i, item) {
            $('#selectedClass').append($('<option>', {
                value: item.canvas_id,
                text: item.canvas_name
            }));
        });

        $('#selectedClass').append($('<option>', {
            value: -1,
            text: "Remove All Classes"
        }));

        //display notification if no courses are stored
        if (courses === undefined) {
            $("#z_notification").text("It seems that no classes are stored. Please go to your Canvas People and Grades tab and refresh the page.").show();
        }
        //display notification if course has no assignments
        if (Object.keys(courses[0].gradebook_save_ids).length == 0) {
            $("#z_notification").text("It seems that the selected class has no assignments stored. Please go to your Canvas Grades tab, select some assignments and refresh the page.").show();
        }

        $.each(courses[0].gradebook_save_ids, function (i, item) {
            $('#selectedAssignment').append($('<option>', {
                value: i,
                text: item
            }));
        });


    });
}

function fillData() {
    //Fill data from memory
    chrome.runtime.sendMessage({
        sendBack: true,
        id: "MLP_assignment",
        canvas_id: $('#selectedClass').val()

    }, function (data) {
        console.log(data);
        backData = data;

        //enter values to MLP
        $("#TableStudents tr").slice(1).each(function () {
            if (courses[courses_actIndex].id_pid_to_canvasid.hasOwnProperty(this.children[1].innerText.trim())) {
                try {
                    result = data[courses[courses_actIndex].id_pid_to_canvasid[this.children[1].innerText.trim()]][$("#selectedAssignment").val()];

                    $(this).find("td span input").first().val(result)
                    $(this).find('td span').next().val(result)
                    this.style.background = "lightgreen"
                    $(this).removeClass("alt")
                } catch (e) {
                    console.log(e);
                }
            }
        });
    });

    //Save student PID <-> MLP ID
    var id_mlpid_to_pid = {};
    $("#TableStudents tr").slice(1).each(function () {
        try {
            id_mlpid_to_pid[$(this).find("input")[0].value] = $(this).find("td:nth-child(2)").text();
        } catch (e) {
            console.log(e);
        }
    });
    courses[courses_actIndex]["id_mlpid_to_pid"] = id_mlpid_to_pid;

    //Contact parent window for MLP course ID
    chrome.runtime.sendMessage({
        id: "transfer"
    }, function (response) {
        courses[courses_actIndex]["mlp_course_id"] = response.mlp_course_id;

        //Save data back to Local storage
        chrome.storage.local.set({
            courses: courses
        }, function () {
            // Notify that we saved data
            //console.log('Settings saved');

        });
    });



}

function fillDataFromClpb() {
    //enter values to MLP
    $("#TableStudents tr").slice(1).each(function () {
        if (clpbData.hasOwnProperty(this.children[1].innerText.trim())) {
            try {
                result = clpbData[this.children[1].innerText.trim()];

                $(this).find("td span input").first().val(result)
                $(this).find('td span').next().val(result)
                this.style.background = "lightgreen"
                $(this).removeClass("alt")
            } catch (e) {
                console.log(e);
            }
        }
    });
}

function refreshPrediction() {
    //get courses from storage
    chrome.storage.local.get(['courses'], function (storage) {
        courses = storage.courses;
    });
    if ($("#selectedAssignment").val() != null)
        chrome.runtime.sendMessage({
            sendBack: true,
            id: "MLP_assignment",
            canvas_id: $('#selectedClass').val()

        }, function (data) {
            if (data === null) {
                //display/hide notification if course has no students' data

                $("#z_notification").text("No grades are stored. Please go to your Canvas Grades tab to load some data.").show();
            } else {
                //display how many students we can complete
                var count = 0;
                var pid_count = 0;
                $("#TableStudents tr").slice(1).each(function () {
                    if (this.children[1].innerText.trim() != "") {
                        //count displayed student ids
                        pid_count++;
                    }
                    if (courses[courses_actIndex].id_pid_to_canvasid.hasOwnProperty(this.children[1].innerText.trim())) {
                        //count if the row can be filled
                        if (data[courses[courses_actIndex].id_pid_to_canvasid[this.children[1].innerText.trim()]] != undefined && data[courses[courses_actIndex].id_pid_to_canvasid[this.children[1].innerText.trim()]].hasOwnProperty($("#selectedAssignment").val()))
                            count++;
                    }
                });

                // No grades can be assigned
                if (count == 0) {
                    // PID missing in MLP
                    if (pid_count == 0) {
                        $("#z_notification").text("Please add student IDs. MLP -> Gradebook -> More Tools -> Add/Edit Student IDs").show();

                        // PID to Canvas ID is missing
                    } else if (Object.keys(courses[courses_actIndex].id_pid_to_canvasid).length == 0) {
                        $("#z_notification").text("I cannot assign any grades. Missing pairing between PID and Canvas ID. Please go to Canvas -> People and scroll to the end.").show();
                    } else {
                        $("#z_notification").text("I cannot assign any grades.").show();
                    }

                } else {
                    $("#z_notification").html("I can assign grades to <strong>" + count + "</strong> students.").show();
                }
            }


        });
    // Check clipboard for excel data to use
    chrome.runtime.sendMessage({
        sendBack: true,
        id: "MLP_assignment_clipboard"

    }, function (data) {
        clpbData = data;
        if (clpbData != null && Object.keys(clpbData).length > 1) {
            // student data in clipboard
            clipboardDiv.style.display = "";
            // find how many students we can complete
            var count = 0;
            $("#TableStudents tr").slice(1).each(function () {
                if (clpbData.hasOwnProperty(this.children[1].innerText.trim())) {
                    //count if the row can be filled
                    count++
                }
            });
            if (count > 0) {
                $("#clpbrd_notification").html("I can assign grades to <strong>" + count + "</strong> students.");
            } else {
                clipboardDiv.style.display = "none";
            }

        } else {
            clipboardDiv.style.display = "none";
        }
    });
}

var clipboardDiv = document.createElement('div');
clipboardDiv.style.display = "none";

var div = document.createElement('div');
div.appendChild(clipboardDiv);
div.style.textAlign = "";
div.style.fontSize = "large";
div.style.backgroundColor = "rgb(250, 250, 250)";
span = document.createElement('span')
span.innerText = "Class: ";
div.appendChild(span);
span = span.cloneNode();

drpbox = document.createElement("select");
drpbox.id = "selectedClass"
drpbox.addEventListener('change', function () {
    //class changed
    console.log(this.value)
    
    //Clear all classes from memory
    if(this.value == -1){
        chrome.storage.local.set({
            courses: []
        }, function () {
            // Notify that we saved data
            //console.log('Settings saved');
        });
        tableLoaded();
        return;
    }

    //find course id
    for (var i in courses) {
        if (courses[i].canvas_id == this.value) {
            courses_actIndex = i;

            //display/hide notification if course has no assignments
            if (Object.keys(courses[i].gradebook_save_ids).length == 0) {
                $("#z_notification").text("It seems that the selected class has no assignments stored. Please go to your Canvas Grades tab, select some assignments and refresh the page.").show();
            } else {
                $("#z_notification").hide();
            }

            $('#selectedAssignment').empty();
            $.each(courses[i].gradebook_save_ids, function (i, item) {
                $('#selectedAssignment').append($('<option>', {
                    value: i,
                    text: item
                }));
            });
            refreshPrediction();
        }
    }


});

span.innerText = "  Assignment: ";
div.appendChild(drpbox);
div.appendChild(span);
drpbox = drpbox.cloneNode();
drpbox.id = "selectedAssignment"
// Add even listener to show details
drpbox.addEventListener('change', function () {
    refreshPrediction();
});

div.appendChild(drpbox);

btn = document.createElement("button");
btn.innerText = "Fill data";
btn.style.marginRight = "5px";
btn.style.marginLeft = "5px";
btn.style.backgroundColor = "antiquewhite";
btn.type = "button";
btn.addEventListener('click', function (e) {
    fillData();
});

text = document.createElement('div');
text.id = "textdiv";



div.appendChild(btn);
div.appendChild(text);

var notification = document.createElement("span");
notification.id = "z_notification";
notification.style.color = "darkred"
div.appendChild(notification);

// elements for clipboard
btn = btn.cloneNode();
btn.innerText = "Fill from Clipboard";
btn.style.marginRight = "5px";
btn.style.marginLeft = "5px";
btn.style.backgroundColor = "antiquewhite";
btn.type = "button";
btn.addEventListener('click', function (e) {
    fillDataFromClpb();
});
clipboardDiv.appendChild(btn);

notification = notification.cloneNode();
notification.id = "clpbrd_notification";
notification.style.color = "darkgreen";
clipboardDiv.appendChild(notification);
