const axios = require('axios');
const moment = require('moment-timezone');

var {Driver} = require('../models/driver');
var {Request} = require('../models/request');
var {NGO} = require('../models/ngo');
var {User} = require('../models/user'); //redundant can remove, but just don't feel like today

var userLocation;
var activeDrivers = [];
var onlineDrivers = [];

var assign = (request, user, callback) => { 
    var assignedDriver;
    // console.log("Entered assign function");

    userLocation = request.address.location;
    activeDrivers = [];
    onlineDrivers = [];
    return Driver.find().then((drivers) => {

        for (var i = 0 ; i < drivers.length; ++i) {
            if(drivers[i].active && !drivers[i].requests.length)
                activeDrivers.push(drivers[i]);
            if(drivers[i].active)
                onlineDrivers.push(drivers[i]);
        }

        if (!activeDrivers.length) {
            if(!onlineDrivers.length) {
                callback(false, "Sorry, but we have no drivers free at the moment to fulfill your request. Please try again later.");
                return Promise.reject({code:"007" ,message: "Sorry, but we have no drivers free at the moment to fulfill your request. Please try again later."});
            }
            return findLeastETA(callback);
        }
        else
            return Promise.all(activeDrivers.map(calculateETA));
    }).then((durations) => {
        var index;
        var leastDuration = Number.MAX_SAFE_INTEGER;
        // console.log("durations",durations);
        for(var i = 0 ; i < durations.length; ++i) {
            if(durations[i] !== undefined && durations[i] < leastDuration) {
                leastDuration = durations[i];
                index = i;
            }
        }

        if(leastDuration === Number.MAX_SAFE_INTEGER) {
            callback(false, "Sorry, but our route optimization systems could not find a way to reach you.");
            return Promise.reject({code:"007" ,message: "Sorry, but our route optimization systems could not find a way to reach you."});
        }
        
        var currentTime = new Date().getTime();
        
        // console.log("least dur", leastDuration);
        request.ETA = currentTime + leastDuration;
        request.driver_code = activeDrivers[index].code;
        request.status = 1;
        request.statusInWords = "Assigned";

        return request.save();
    }).then((request) => {
        // console.log("request", request);
        return Driver.findByCode(request.driver_code).then((driver) => {
            var newRequestNumber = {
                request: request.ref
            };

            driver.requests.push(newRequestNumber);
            return driver.save();
        })
    }).then((driver) => {
        assignedDriver = driver;

        return assignNGO(request);
    }).then((request) => {
        user.requests.push({request: request.ref});
        user.active = true;
        
        return user.save();  
    }).then((user) => {
        return Promise.resolve(assignedDriver);
    });
};

function assignNGO (request) {
    var mostDemandSumNGO;
    var maxDemand = Number.MIN_SAFE_INTEGER;

    return NGO.find().then((ngos) => {
        for(var i = 0; i < ngos.length; ++i) {
            var ngo = ngos[i];
            var demandSum = 0;

            for(var j = 0 ; j < ngo.demand.length; ++j) {
                demandSum += ngo.demand[j].numberOfBooksRequired;
            }

            if(demandSum > maxDemand) {
                maxDemand = demandSum;
                mostDemandSumNGO = ngo.name;
            }
        }

        request.NGO = mostDemandSumNGO;
        return request.save();
    });
}

function calculateETA (driver) {
    var location = driver.location;
    var lat = location.latitude;
    var lng = location.longitude;

    var distancematrixURL = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${lng}&destinations=${userLocation.latitude},${userLocation.longitude}&departure_time=now&key=AIzaSyCk5aSoagjsGq9bHyOFlNKFaI5Evy1wDnY`;
    return axios.get(distancematrixURL).then((response) => {
        if(response.data.rows[0].elements[0].status == "NOT_FOUND") {
            // console.log("NOT_FOUND");
            return Promise.resolve(undefined);
        }
        // console.log("time taken: ", response.data.rows[0].elements[0].duration_in_traffic.value * 1000);
        return Promise.resolve(response.data.rows[0].elements[0].duration_in_traffic.value * 1000);
    });
};

function findLeastETA(callback) {
    return Promise.all(onlineDrivers.map(findETA)).then((ETAs) => {
        var leastETA = Number.MAX_SAFE_INTEGER;

        for(var i = 0 ; i < ETAs.length; ++i)
            leastETA = Math.min(leastETA, ETAs[i]);
        var timeIST = toTimeZone(leastETA, 'Asia/Kolkata');
        callback(false, `Sorry, but we don't have a pickup driver nearby. Please try again after ${timeIST}, our systems indicate that a driver will most probably be available in your area after this time.`);
        return Promise.reject({code:"007" ,message: `Sorry, but we don't have a pickup driver nearby. Please try again at ${timeIST}, our systems indicate that a driver will most probably be available in your area at this time.`});
    });
}

function findETA (driver) {
    var requestRef = driver.requests[0].request;
    return Request.findByRef(requestRef).then((request) => {
        // console.log("found busy driver request");
        return Promise.resolve(request.ETA);
    })
}

function toTimeZone(time, zone) {
    var format = 'hh:mm a z';
    return moment(time).tz(zone).format(format);
}

module.exports = {assign};