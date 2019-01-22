var socket = io();

var token;

function authenticateDriver() { //misnomer, correct later
    token = document.getElementById('tokenField').value;
    socket.emit('driverOpen', {code: token});
    socket.emit('driverRequests', {code: token});

    setInterval(function() {
        socket.emit('driverRequests', {code: token});
    }, 30000);
    
    updateLocation();
}

function updateLocation() {
    setInterval(function() {
        var time = new Date().getTime();
        console.log("Updating location at time:", time);
        navigator.geolocation.getCurrentPosition(function(location) {
            socket.emit('driverLocationUpdate', {
                code: token,
                location: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                }
            });
        });
    }, 10000);
}


jQuery('#tokenForm').on('submit', function(e) {
	e.preventDefault();

    authenticateDriver();
});

socket.on('driverRequestsReturning', function (params) {
    jQuery('#tokenForm').hide();
    jQuery('#completePickup').show();
    jQuery('#signOut').show();
    loadRequests(params.requests);
});

function loadRequests(requests) {
    $(".request").remove();
        
    console.log("The pending requests are", requests);
    for(var i = 0 ; i < requests.length; ++i) {

        var request = requests[i];

        var ETA = moment(request.ETA).format('h:mm a');
        var date = moment(request.ETA).format('MMM D, Y');

        var tel = request.user_phone;

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
                        Navigate
                    </a>
                </div>
               
                <div class="table tel">
                    <a class="paramter loc" href="tel:${tel}">Call Donor</a>
                </div>

                <div class="table">
                    <p class="paramter">Status: </p>
                    <p class="content">${request.statusInWords}</p>
                </div>

                <div class="table">
                    <p class="paramter">Promised pickup time: </p>
                    <p class="content">${ETA}</p>
                </div>
        `;

        requestHTML += `</div>`;

        $('#requests').append(requestHTML);

        // var currentRequest = document.createElement("div");
        
        // var full = document.createElement('p');
        // full.textContent = "Address: " + requests[i].address.full;

        // var ref = document.createElement('h3');
        // ref.textContent = "Ref: " + requests[i].ref;

        // var ETA = document.createElement('p');
        // var pickUpTime = moment(requests[i].ETA).format('h:mm a');
        // ETA.textContent = "Pickup time: " + pickUpTime;

        // var statusInWords = document.createElement('p');
        // statusInWords.textContent = "Status: " + requests[i].statusInWords;

        // var navigationLink = document.createElement('a');
        // navigationLink.textContent = "Navigate";
        // navigationLink.href = "https://www.google.com/maps/search/?api=1&query=" + requests[i].address.location.latitude + ',' + requests[i].address.location.longitude;
        // navigationLink.setAttribute('target', '_blank');
        
        // currentRequest.appendChild(ref);
        // currentRequest.appendChild(full);
        // currentRequest.appendChild(ETA);
        // currentRequest.appendChild(statusInWords);
        // currentRequest.appendChild(navigationLink);

        // currentRequest.style.borderBottom = "medium solid #8F4401";
	    // currentRequest.style.borderTop = "medium solid #8F4401";
	    // currentRequest.style.borderLeft = "medium solid #8F4401";
	    // currentRequest.style.borderRight = "medium solid #8F4401";
	    // currentRequest.style.paddingLeft = "0.5em";
        // currentRequest.style.paddingBottom = "1em";
        // currentRequest.style.marginTop = "1em";

        // document.body.appendChild(currentRequest);
    }
}

$('#completePickup').click(function() {
    console.log("complete pickup button clicked");
    socket.emit('pickupDone', {code: token}, function() {
        console.log("callback initiated");
        socket.emit('driverRequests', {code: token});
    });
});

$('#signOut').click(function() {
    console.log("sign out button clicked");

    socket.emit('driverClose', {code: token}, function() {
        $('#message').text("PLEASE CLEAR YOUR PENDING REQUESTS BEFORE SIGNING OFF");
    });
});

socket.on('driverClosed', function() {
    window.location = "driverSignedOut";
});


