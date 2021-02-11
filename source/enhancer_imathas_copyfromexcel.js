var backData;
var clpbData = {};

waitTableStudentsToLoad();
refreshNotification();

function waitTableStudentsToLoad() {
    if ($("#myTable").length == 0) {
        setTimeout(function () {
            waitTableStudentsToLoad()
        }, 1500);
    } else {
        setTimeout(function () {
            console.log('Table of students loaded.');
            tableLoaded();
        }, 2000);
    }
}

function refreshNotification() {

    setTimeout(function () {
        refreshPrediction();
        refreshNotification();
    }, 1000);
}

function tableLoaded() {
    $(div).insertBefore($("#myTable"));
    $(div).hide();
    $(div).slideDown();
}

function fillDataFromClpb() {
    var columnIdForGrades = null;
    //find the column index with "Grade"
    for(var i = 0; i < $("#myTable th").length; i++){
        if($("#myTable th")[i].innerText == "Grade"){
            columnIdForGrades = i;
            break;
        }
    }
    //enter values to MLP
    $("#myTable tr").slice(1).each(function () {
        if (clpbData.hasOwnProperty(this.children[0].innerText.split(',')[0].trim())) {
            try {
                result = clpbData[this.children[0].innerText.split(',')[0].trim()];

                $(this.children[columnIdForGrades]).find("input").first().val(result)
                this.style.background = "lightgreen"
                $(this).removeClass("alt")
            } catch (e) {
                console.log(e);
            }
        }
    });
}

function refreshPrediction() {
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
            $("#myTable tr").slice(1).each(function () {
                if (clpbData.hasOwnProperty(this.children[0].innerText.split(',')[0].trim())) {
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
div.style.backgroundColor = "rgb(200, 200, 200)";
$(div).hide;

var span = document.createElement("span");
span.innerText = "To copy grades from excel select area that has Last names in the first selected column and grades in the last selected column.";
div.append(span);

var notification = document.createElement("span");
notification.id = "z_notification";
notification.style.color = "darkred"
div.appendChild(notification);

// elements for clipboard
btn = document.createElement("button");
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
