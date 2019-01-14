var socket = io();

socket.on('registered', function (token) {
	alert(token);
});

//event listeners =>