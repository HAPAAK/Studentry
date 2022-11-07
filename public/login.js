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
    var button = document.getElementById("addnote");
    var myDiv = document.getElementById("eventsdetails");
    if (myDiv.style.visibility === "hidden") {
        myDiv.style.visibility = "visible";  
    } else {
        myDiv.style.visibility = "hidden"; 
    }
}

function editbtn() {
    var edbtn = document.getElementById("edit");
    var subtn =document.getElementById("submit");
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