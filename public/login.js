$("#password-checkbox").click(function() {
    if($(this).prop("checked") === true) {
        $("#password").attr("type", "text");
    } else {
        $("#password").attr("type", "password");
    }
});

// $("#studentlogin-form").submit(function(e) {
//     e.preventDefault();
// });

function preview(){
    document.getElementById("frame").style.display='block';
    document.getElementById("frame").src = URL.createObjectURL(event.target.files[0]);
}
    
function shownoteentry() {
    var button = document.getElementById("toggle");
    var myDiv = document.getElementById("eventsdetails");
    var etyp = document.getElementById("eventtype");
    if (myDiv.style.visibility === "hidden") {
        button.value = "Event";
        button.innerHTML="Add Note";
        etyp.value="Event";
        myDiv.style.visibility = "visible";  
    } else {
        button.innerHTML = "Add event";
        button.value="Note";
        etyp.value="Note";
        myDiv.style.visibility = "hidden"; 
    }
}

function editbtn() {
    var edbtn = document.getElementById("edit");
    var subtn =document.getElementById("submit");
    document.getElementById("myprofile").style.display="block";
    edbtn.style.display="none";
    subtn.style.display="block";

    var myInp = document.getElementsByClassName("myinp");
    console.log(myInp);
    for (let index = 0; index < myInp.length; index++) {
        myInp[index].removeAttribute('readonly');
        myInp[index].style.border="1px solid #000";
    }
    
}

$(".pass-btn").click(function() {
    alert("Check your email to get password");
});