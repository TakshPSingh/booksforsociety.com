//basic system checking

if(!localStorage)
	alert("Please update to a modern browser. Some features might not work on your browser");

//checking for prior login and changing flow accordingly

var token = localStorage.getItem('token');

if(token) {
    $('#account').text('Account').click(function() {
        window.location = "account";
    });
}
else {
    $('#account').click(function() {
        window.location = "sign";
    });
}

//Setting Nav bar links + banner link

$('#banner').click(function() {
    window.location = "index";
});

$('#donate').click(function() {
    window.location = "donate";
});

$('#track').click(function() {
    window.location = "track";
});

$('#about').click(function() {
    window.location = "index#mission";
});