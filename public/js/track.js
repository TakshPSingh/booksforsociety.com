//Initialization and stuff =>

var socket = io();

var firstCall = true, loc;

//socket.io events (fies time checking, regular checking etc.), this all begins when Google Maps scripts load =>

function beginTracking() {
    $('#message').text('Checking right now...');

    socket.emit('getRequestStatus', {token:token});
}

socket.on('noActiveRequest', function() {
    $('#message').html('You have no active requests to track right now. To view previous requests, <a href="account">click here.</a>');
    $('#map').empty();
    $('#details').empty();
});

socket.on('sendRequestStatus', function(params) {
    $('#message').text('Tracking request in real time =>');
    
    displayLocationOnMap(params.driver);

    if(firstCall) {
        firstCall = false;
        displayRequestDetails(params.request, params.driver);
        callServerForLocationRegularly();
    }
});

function callServerForLocationRegularly() {
    console.log("callServerForLocationRegularly function entered");

    setInterval(function() {
        socket.emit('getRequestStatus', {token:token});
    }, 15000);
}

// Displaying driver location on map =>

function displayLocationOnMap(driver) {
  console.log("displayLocationOnMap entered");
  var mapDOM = document.getElementById('map');

  loc = {
      lat: driver.location.latitude,
      lng: driver.location.longitude
  };

  var map = new google.maps.Map(mapDOM, {zoom: 16, center: loc});
  var marker = new google.maps.Marker({position: loc, map: map, title: driver.name, label: {
      text: "Driver"
  }});

  $('#map').show();
}

function displayRequestDetails(request, driver) {
    console.log("displayRequestDetails function called");

    $('#details').empty();

    var ETA = moment(request.ETA).format('h:mm a');
    var date = moment(request.ETA).format('MMM D, Y');
    var tel = "+91" + driver.phone;

    var mapLink = "https://www.google.com/maps/search/?api=1&query=" + request.address.location.latitude + ',' + request.address.location.longitude;

    var requestHTML = `
        <div class="request">
            <p class="ref">Ref: ${request.ref}</p>

            <div class="table">
                <p class="paramter">Driver:</p>
                <p class="content">${driver.name}</p>
            </div>

            <div class="table">
                <p class="paramter">Vehicle:</p>
                <p class="content">${driver.vehicle}</p>
            </div>

            <div class="table">
                <a class="paramter loc" href="tel:${tel}" target="_blank">
                    Call Driver
                </a>
            </div>

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

    requestHTML += `<div class="table">
    <a class="paramter loc" href="tel:+919716610606" target="_blank">
        Call Support
    </a>
</div>`
    requestHTML += `</div>`;

    $('#details').append(requestHTML);
}