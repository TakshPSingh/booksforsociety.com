//basic system checking

if(!localStorage)
	alert("Please update to a modern browser. Some features might not work on your browser");

//checking for prior login and changing flow accordingly

var token = localStorage.getItem('token');

if(token) {
    $('#account').text('Account').click(function() {
        window.location = "account.html";
    });
}
else {
    $('#account').click(function() {
        window.location = "sign.html";
    });
}

//Setting Nav bar links + banner link

$('#banner').click(function() {
    window.location = "index.html";
});

$('#donate').click(function() {
    window.location = "donate.html";
});

$('#track').click(function() {
    window.location = "track.html";
});

$('#about').click(function() {
    window.location = "index.html#mission";
});