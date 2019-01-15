if(!localStorage)
	alert("Please update to a modern browser. Some features might not work on your browser");

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