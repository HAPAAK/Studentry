$("#password-checkbox").click(function() {
    if($(this).prop("checked") === true) {
        $("#password").attr("type", "text");
    } else {
        $("#password").attr("type", "password");
    }
});

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

$(".pass-btn").click(function() {
    alert("Check your email to get password");
});