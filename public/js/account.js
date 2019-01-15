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
    if(requests.length === 1)
        $('#requestsMessage').text('1 record found:');
    if(requests.length > 1)
        $('#requestsMessage').text(requests.length + ' records found:');

    for(var i = 0 ; i < requests.length; ++i) {

        var request = requests[i];

        var ETA = moment(requests[i].ETA).format('h:mm a');
        var ATA = moment(requests[i].ATA).format('h:mm a');
        var mapLink = "https://www.google.com/maps/search/?api=1&query=" + requests[i].address.location.latitude + ',' + requests[i].address.location.longitude;

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
                    <p class="content">${requests[i].statusInWords}</p>
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

        if(requests[i].ATA) {
            requestHTML += ATAHTML;
        }

        requestHTML += `</div>`;

        $('#previousRequests').append(requestHTML);

        // var currentRequest = document.createElement("div");
        // currentRequest.className = "request";

        // var full = document.createElement('p');
        // full.textContent = "Address: ";
        
        // var full2 = document.createElement('p');
        // full2.textContent = requests[i].address.full;

        // var ref = document.createElement('h3');
        // ref.textContent = "Ref: " + requests[i].ref;

        // var ETA = document.createElement('p');
        // ETA.textContent = "Estimated Pickup time: ";

        // var ETA2 = document.createElement('p');
        // var pickUpTime = moment(requests[i].ETA).format('h:mm a');
        // ETA2.textContent = pickUpTime;

        // var statusInWords = document.createElement('p');
        // statusInWords.textContent = "Status: " + requests[i].statusInWords;

        // var mapLink = document.createElement('a');
        // mapLink.textContent = "Map location";
        // mapLink.href = "https://www.google.com/maps/search/?api=1&query=" + requests[i].address.location.latitude + ',' + requests[i].address.location.longitude;
        // mapLink.setAttribute('target', '_blank');
        
        // currentRequest.appendChild(ref);
        // currentRequest.appendChild(full);
        // currentRequest.appendChild(full2);
        // currentRequest.appendChild(ETA);
        // currentRequest.appendChild(ETA2);
        // currentRequest.appendChild(statusInWords);
        // currentRequest.appendChild(mapLink);

        // currentRequest.style.borderBottom = "medium solid #8F4401";
	    // currentRequest.style.borderTop = "medium solid #8F4401";
	    // currentRequest.style.borderLeft = "medium solid #8F4401";
	    // currentRequest.style.borderRight = "medium solid #8F4401";
	    // currentRequest.style.paddingLeft = "0.5em";
        // currentRequest.style.paddingBottom = "1em";
        // currentRequest.style.marginTop = "1em";

        // $('#previousRequests').append(currentRequest);
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