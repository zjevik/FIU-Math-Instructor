var backData;

setTimeout(function () {
    chrome.runtime.sendMessage({
        sendBack: true,
        id: "MLP_studentID"
    }, function (data) {
        console.log(data);
        backData = data;
        var i = 0;
        for (var key in data.panther) {
            $('#selectedClass').append($('<option>', {
                value: i++,
                text: key
            }));
        }
    });
}, 500);

function fillData() {
    students = backData.panther[$("#selectedClass option:selected").text()];

    //pre-process
    dic = {};
    for (var i in students) {
        student = students[i]
        dic[student.email] = student.id;
    }

    //enter student IDs
    $("#maindiv table tr").each(function (index) {
        row = $("#maindiv table tr")[index];
        if (!row.children[2].innerText.includes(" ")) {
            row.children[3].children[1].value = dic.hasOwnProperty(row.children[2].innerText) ? dic[row.children[2].innerText] : "DROP";
            delete dic[row.children[2].innerText];
        }
    })

    //notify user about extra and missing students
    if (Object.keys(dic).length > 0) {
        text = "Missing students' emails:";
        for (var i in dic) {
            text = text.concat(" ", i, ";");
        }
        text = text.slice(0, -1);
        $("#textdiv").text(text);
    }
}

// Run the script


var div = document.createElement('div');
div.style.textAlign = "";
div.style.fontSize = "large";
div.style.backgroundColor = "rgb(250, 250, 250)";

drpbox = document.createElement("select");
drpbox.id = "selectedClass"


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


div.appendChild(drpbox);
div.appendChild(btn);
div.appendChild(text);

var notification = document.createElement("span");
notification.id = "z_notification"
div.appendChild(notification);
document.getElementsByClassName("label-display-inline")[0].appendChild(div);
