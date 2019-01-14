var socket = io();
var token;

$('#signUp').on('submit', function(e) {
	console.log("new user register function entered");
	e.preventDefault();

	var name = $('#name').val();
	var email = $('#newEmail').val();
	var phone = $('#phone').val();
	var password = $('#newPassword').val();

	$('#newUserButton').val('Signing up...');

	socket.emit('register', {
		name:name,
		email:email,
		phone:phone,
		password:password
	}, function() {
		console.log("Registration failed");
		$('#message').text('Our servers could not register you because you either already have an account or you entered some incorrect information.');
	});
});

socket.on('registered', function(token) {
	console.log("token obtained", token);
	$('#message').text('We are glad to have you on board.');
	$('#newUserButton').val('Welcome!').prop('disabled',true);

	setTimeout(function() {
		//save token to local storage
	}, 5000);
});

//EVENT LISTENERS (secondary) => 

$('#newUserLink').click(function() {
	$('#signIn').hide();
	$('#signUp').show();
});

$('#oldUserLink').click(function() {
    $('#signIn').show();
	$('#signUp').hide();
});