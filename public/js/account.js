//Initialization and rerouting etc.

var socket = io();

if(!token)
    window.location = "sign.html";

//socket.io events =>

socket.emit('checkToken', {token:token});

socket.on('tokenVerified', function(user) {
    $('#name').text(user.name);
    $('#email').text(user.email);
    $('#phone').text(user.phone);
});

socket.emit('findPreviousRequests', {token:token});

socket.on('previousRequests', function(requests) {
    if(!requests.length)
        $('#requestsMessage').text('No donations yet. Why not begin today?');
    else if(requests.length === 1)
        $('#requestsMessage').text('1 record found:');
    else
        $('#requestsMessage').text(requests.length + ' records found:');

    for(var i = requests.length - 1; i >= 0 ; --i) {

        var request = requests[i];

        var ETA = moment(request.ETA).format('h:mm a');
        var date = moment(request.ETA).format('MMM D, Y');
        var ATA = moment(request.ATA).format('h:mm a');
        var mapLink = "https://www.google.com/maps/search/?api=1&query=" + request.address.location.latitude + ',' + request.address.location.longitude;

        var requestHTML = `
            <div class="request">
                <p class="ref">Ref: ${request.ref}</p>

                <div class="table">
                    <p class="paramter">Address: </p>
                    <p class="content">${request.address.full}</p>
                </div>

                <div class="table">
                    <a class="paramter loc" href="${mapLink}" target="_blank">
                        (Mapped Location)
                    </a>
                </div>

                <div class="table">
                    <p class="paramter">Status: </p>
                    <p class="content">${request.statusInWords}</p>
                </div>

                <div class="table">
                    <p class="paramter">Date: </p>
                    <p class="content">${date}</p>
                </div>

                <div class="table">
                    <p class="paramter">Promised pickup time: </p>
                    <p class="content">${ETA}</p>
                </div>
        `;

        var ATAHTML = `<div class="table">
            <p class="paramter">Actual pickup time: </p>
            <p class="content">${ATA}</p>
        </div>`;

        if(request.ATA) {
            requestHTML += ATAHTML;
        }

        if(request.books) {
            requestHTML += `
                <p class="ref">
                    Books:
                </p>
            `;

            for(var j = 0; j < request.books.length; ++j) {
                var book = request.books[j];
                var subject =  book.subject;
                var grade = book.grade;
                
                var bookHTMl = `
                <div class="table books">
                    <p class="paramter">Subject: ${subject}</p>
                    <p class="content">Grade: ${grade}</p>
                </div>`;

                requestHTML += bookHTMl;
            }
        }

        requestHTML += `</div>`;

        $('#previousRequests').append(requestHTML);
    }
});

//reset password

$('#resetPassword').on('submit', function(e) {
    e.preventDefault();

    $('#submit').val('Processing...').prop('disabled', true);
    socket.emit('resetPassword', {
        token: token,
        password: $('#password').val()
    }, function(changed) {
        $('#submit').prop('disabled', false);

        if(changed) {
            $('#passwordMessage').text('Password changed successfully.');
            $('#submit').val('Change Again :)');
        }
        else {
            $('#passwordMessage').text('Please email us. Work with us to expand this app.');
            $('#submit').val('Nice Try :)');
        }
    });
});

//Sign Out =>

$('#signOut').click(function() {
    localStorage.clear();

    $('#signOut').text('Come back soon :)');
    $('#message').text('You have been signed out. Redirecting...')
    
    setTimeout(function() {
        window.location = "sign.html";
    }, 2500);
});