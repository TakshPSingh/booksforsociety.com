var socket = io();

var token;

function authenticateDriver() { //misnomer, correct later
    token = document.getElementById('tokenField').value;
    socket.emit('driverOpen', {code: token});
    socket.emit('driverRequests', {code: token});

    setInterval(function() {
        socket.emit('driverRequests', {code: token});
    }, 45000);
    
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
    }, 15000);
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
    $("div").remove(); //clears all requests on screen. No optimal, but don't have to fix it right now 
        
    console.log("The pending requests are", requests);
    for(var i = 0 ; i < requests.length; ++i) {
        var currentRequest = document.createElement("div");
        
        var full = document.createElement('p');
        full.textContent = "Address: " + requests[i].address.full;

        var ref = document.createElement('h3');
        ref.textContent = "Ref: " + requests[i].ref;

        var ETA = document.createElement('p');
        var pickUpTime = moment(requests[i].ETA).format('h:mm a');
        ETA.textContent = "Pickup time: " + pickUpTime;

        var statusInWords = document.createElement('p');
        statusInWords.textContent = "Status: " + requests[i].statusInWords;

        currentRequest.appendChild(ref);
        currentRequest.appendChild(full);
        currentRequest.appendChild(ETA);
        currentRequest.appendChild(statusInWords);

        currentRequest.style.borderBottom = "medium solid #8F4401";
	    currentRequest.style.borderTop = "medium solid #8F4401";
	    currentRequest.style.borderLeft = "medium solid #8F4401";
	    currentRequest.style.borderRight = "medium solid #8F4401";
	    currentRequest.style.paddingLeft = "0.5em";
        currentRequest.style.paddingBottom = "1em";
        currentRequest.style.marginTop = "1em";

        document.body.appendChild(currentRequest);
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
    window.location = "driverSignedOut.html";
});


