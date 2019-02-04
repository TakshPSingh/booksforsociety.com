var numberOfBooks = 0;

var loc;

var socket = io();

if(!token) {
  $('#flowMessage').text('You need to sign in to donate. Redirecting you to the sign in page...').show();
  $('#donationForm').hide();
  
  setTimeout(function() {
    window.location = "sign";
  }, 2200);
}

//CHECK IF REQUEST ALREADY EXISTS =>

socket.emit('getRequestStatus', {token:token});

socket.on('sendRequestStatus', function() {
    $('#flowMessage').text('You already have a pending pickup request. Redirecting you to the tracking page.').show();
    $('#donationForm').hide();

    setTimeout(function() {
      window.location = "track";
    }, 2820);
});

//BOOKS =>

$('#numberOfBooks').change(function() {
    var numberOfBooksString = $(this).find("option:selected").val();
    numberOfBooks = Number(numberOfBooksString);

    var bookFormHTML = ``;

    $('.book-container').remove(); // removing previous books selections
    $('.book-container-last').remove();
    
    for(var i = 0 ; i < numberOfBooks; ++i) {
        var bookid = "book" + i;
        var gradeid = "grade" + i;

        var currentClass = "book-container";

        if(i === numberOfBooks-1) {
          currentClass = "book-container-last";
        }    

        var bookSelectionMiniFormHTML = `
            <div class="${currentClass}">

            <p class="bookAnnouncer">Book ${i+1} details:</p>
            <select id="${bookid}" class="book" required>
            <option value="" disabled selected>Subject</option>
            <option value="English">English</option>
            <option value="Math">Math</option>
            <option value="Science">Science</option>
            <option value="Computer Science">Computer Science</option>
            <option value="History">History</option>
            <option value="Geography">Geography</option>
            <option value="Political Science">Political Science</option>
            <option value="Civics">Civics</option>
            <option value="Hindi">Hindi</option>
            <option value="Other relevant subject">Other relevant subject</option>
            </select>

            <select id="${gradeid}" class="grade" required>
            <option value="" disabled selected>Grade</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            </select>

            </div>
        `;

        bookFormHTML += bookSelectionMiniFormHTML;
    }
    $('#numberOfBooks').after(bookFormHTML);
});

//GEOLOCATION

$('#useCurrentLocation').click(function() {
  console.log("user");
  
  navigator.geolocation.getCurrentPosition(function(position) {
    loc = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    $('#useCurrentLocation').text('Use current location');
    displayLocationOnMap(loc);
  });
})

//GOOGLE MAPS =>

function getLocationInput() {
  var input = document.getElementById('location');
  var autocomplete = new google.maps.places.Autocomplete(input);
  
  google.maps.event.addListener(autocomplete, 'place_changed', function () {
    var place = autocomplete.getPlace();

    loc = {
      lat: place.geometry.location.lat(), 
      lng: place.geometry.location.lng()
    };

    displayLocationOnMap(loc);    
  });
}

function displayLocationOnMap(loc) {
  $('#locationMessage').text('Location ready:').show();

  var mapDOM = document.getElementById('map');

  var map = new google.maps.Map(mapDOM, {zoom: 15, center: loc});
  var marker = new google.maps.Marker({position: loc, map: map, title: "Pickup location", label:{
    text: "Pickup location"
  }});

  $('#map').show();
}

// FORM SUBMISSION =>

$('#donationForm').on('submit', function(e) {
  e.preventDefault();

  if(!loc) {
    $('.statusMessage').text("We're not spies. Please enter your location").show();
    return;
  }

  var address = {
    full: $('#address').val(),
    location: {
      latitude: loc.lat,
      longitude: loc.lng
    }
  };

  var books = [];
  for(var i = 0 ; i < numberOfBooks; ++i) {
    var bookId = "#book" + i;
    var gradeId = "#grade" + i;
    
    books.push({
      grade: $(gradeId).find("option:selected").val(),
      subject: $(bookId).find("option:selected").val()
    });
  }

  $('#donateButton').val('Sending request =>').prop('disabled',true);

  socket.emit('newRequest',{
    token: token,
    address: address,
    books: books
  }, 
    function(done, message) {
      $('#donateButton').val('Try again :)').prop('disabled',false);

      if(done) {
        $('#donationForm').hide();
        $('#flowMessage').text('Congratulations! Your pickup request has been accepted. Redirecting you to the tracking page.').show();
        
        setTimeout(function() {
          window.location = "track";
        }, 4000);
      } 
      else {
        $('.statusMessage').text(message).show();
      }
  });
});