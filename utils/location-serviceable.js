const axios = require('axios');

var locationServiceable = (location) => {
    var latitude = location.latitude;
    var longitude = location.longitude;
    
    var geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCk5aSoagjsGq9bHyOFlNKFaI5Evy1wDnY`;
    
    return axios.get(geocodeUrl).then((response) => {
        if(response.data.status === 'ZERO_RESULTS')
            return Promise.reject("Sorry, but your location is not serviceable");
        var address = response.data.results[0].address_components;
        
        console.log("Address",address);
        var Noida = false;
        for(var i = 0 ; i < address.length; ++i) {
            if(address[i].long_name === "Noida") {
                Noida = true;
                i = address.length;
            }
        }

        if(Noida)
            return Promise.resolve();

        return Promise.reject("Sorry, but we currently do not operate outside Noida.");
    });
};

module.exports = {locationServiceable};

// For testing

// locationServiceable({latitude: 28.5189925,longitude: 75.382538}).then(() => {
//     console.log("In noida");
// }).catch((err) => {
//     console.log("Err",err);
// });

//TESTING PASSED