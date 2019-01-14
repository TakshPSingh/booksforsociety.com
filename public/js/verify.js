var socket = io();

$('#signIn').on('submit', function(e) {
    e.preventDefault();

    socket.emit('resetPassword', 
    {
        token: $('#token').val(),
        password: $('#password').val()
    }, 
    function(changed) {
        if(changed)
            $('#message').text("Password was reset successfully");
        else
            $('#message').text("Password reset unsuccessful. Please ensure that you entered a password and the correct token");
    });
});