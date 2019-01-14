var socket = io();

//EVENT LISTENERS => 

$('#newUserLink').click(function() {
	$('#signIn').hide();
	$('#signUp').show();
});

$('#oldUserLink').click(function() {
    $('#signIn').show();
	$('#signUp').hide();
});