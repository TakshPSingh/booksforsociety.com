var socket = io();

if(token) {
    $('#message').text('You are already logged in. Redirecting you to the home page.');
	setTimeout(function(){
		window.location = "index.html";
	}, 2500);
}

//FORGOT PASSWORD =>

$('#forgotPassword').on('submit',function(e) {
	e.preventDefault();
	$('#forgotPasswordButton').val('Done.').prop('disabled', true);
	$('#message').text('If the email address that you provided was on our records, you will receive an email shortly with further instructions.');

	socket.emit('forgotPassword', {
		email: $('#accountEmail').val()
	});
});

//SIGN IN =>

$('#signIn').on('submit', function(e) {
	e.preventDefault();
	$('#signInButton').val('Authenticating...').prop('disabled',true);

	var email = $('#email').val();
	var password = $('#password').val();

	socket.emit('login', {
		email:email,
		password:password
	}, function() {
		$('#message').text('Authentication failed. Make sure you are entering the correct credentials.');		
		$('#signInButton').val('Try again').prop('disabled',false);
	});
})

socket.on('token', function(tokenFromServer) {
	token=tokenFromServer;
	localStorage.setItem('token',token);
	$('#message').text('Welcome back. Redirecting you to the homepage.');
	$('#signInButton').val('Welcome.').prop('disabled',true);
	setTimeout(function(){
		window.location = "index.html";
	}, 2500);
});

//SIGN UP =>

$('#signUp').on('submit', function(e) {
	e.preventDefault();

	var name = $('#name').val();
	var email = $('#newEmail').val();
	var phone = $('#phone').val();
	var password = $('#newPassword').val();

	$('#newUserButton').val('Signing up...').prop('disabled',true);

	socket.emit('register', {
		name:name,
		email:email,
		phone:phone,
		password:password
	}, function() {
		console.log("Registration failed");
		$('#message').text('Our servers could not register you because you either already have an account or you entered some incorrect information.');
		$('#newUserButton').val('Try again').prop('disabled',false);
	});
});

socket.on('registered', function(tokenFromServer) {
	$('#message').text('We are glad to have you on board. Redirecting you to the home page.');
	$('#newUserButton').val('Welcome!').prop('disabled',true);

	setTimeout(function() {
		localStorage.clear();
		token=tokenFromServer
		localStorage.setItem('token',token);
		window.location = "index.html";
	}, 2500);
});

//EVENT LISTENERS (secondary) => 

$('#newUserLink').click(function() {
	$('#signIn').hide();
	$('#signUp').show();
	$('#message').text('');
});

$('#oldUserLink').click(function() {
    $('#signIn').show();
	$('#signUp').hide();
	$('#message').text('');
});

$('#forgotPasswordLink').click(function() {
	$('#signIn').hide();
	$('#signUp').hide();
	$('#forgotPassword').show();
	$('#message').text('');
});