var number = "";

function waitForLoad(id) {
    if (document.getElementById("DERIVED_SSR_FC_SSR_CLASSNAME_LONG") == null) {
        if (id < 15) {
            setTimeout(function () {
                waitForLoad(id + 1)
            }, 500);
        }

    } else {
        setTimeout(function () {
            console.log('Roster loaded. Saving...');
            if(document.getElementById("win2divPSTOOLSHIDDENS") != null){
                number = "2";
            } else{
                number = "1";
            }
            document.getElementById("win"+number+"divPSTOOLSHIDDENS").insertBefore(div, document.getElementById("pt_modalMask"));
            

            readStudents();
        }, 750);
    }
}

function readStudents() {
    students = [];
    className = "";
    try {
        className = document.getElementById("DERIVED_SSR_FC_SSR_CLASSNAME_LONG").innerHTML;

        //get student's data
        document.querySelectorAll('#win'+number+'divPAGECONTAINER tr [valign="center"]').forEach(function (row) {
            if (row.childElementCount > 4 && row.children[6].innerText.trim() != "Admin") {
                student = {};
                student.id = row.children[3].innerText.trim();
                student.email = row.children[4].innerText.trim();
                tmp = row.children[5].innerText.split(",");
                student.lastName = tmp[0].trim();
                student.firstName = tmp[1].trim();

                students.push(student);
                console.log(student);
            }

        });
        console.log(students);

        //Send student data to background page
        chrome.runtime.sendMessage({
            sendBack: false,
            id: "panthersoft",
            data: students,
            className: className
        }, function (response) {
            if (response == true) {
                var status = document.getElementById('z_notification');
                status.innerText = 'Data saved';
                setTimeout(function () {
                    status.innerText = '';
                }, 1750);
            }
        });
    } catch (e) {
        console.log("Error:")
        console.log(e);
    }
}

// Run the script
var div = document.createElement('div');
div.style.textAlign = "center";
div.style.fontSize = "x-large";
div.style.backgroundColor = "lightgreen";

var notification = document.createElement("span");
notification.id = "z_notification"
div.appendChild(notification);

waitForLoad(0);
