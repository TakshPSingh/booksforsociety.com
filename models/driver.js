const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

const {Request} = require('./request');

var DriverSchema = new mongoose.Schema({
	code: {
		type: Number,
		required: true
	},
	active: {
		type: Boolean,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	requests: [ {request: {
		type: Number
	}
}],
	vehicle: {
		type: String,
		required: true
	},
	phone: {
		type: Number,
		minlength: 10,
		required: true
	},
	location: {
		latitude: {
			type: Number
		},
		longitude: {
			type: Number
		}
	}
});

DriverSchema.methods.toJSON = function () {
  var driver = this;
  var driverObject = driver.toObject();

  return _.pick(driverObject, ['_id', 'phone', 'vehicle', 'name']);
};

DriverSchema.statics.findByCode = function (code) {
  var Driver = this;
  return Driver.findOne({code});
};

DriverSchema.methods.locate = function() {
	var driver = this;
	return driver.location;
};

DriverSchema.statics.driverLocationUpdate = function(params) {
	var Driver = this;
	Driver.findByCode(params.code).then((driver) => {
		return new Promise((resolve, reject) => {
			if (!driver) {
				reject("Driver not found");
			}
			else {
				driver.location = params.location;
				resolve(driver);
			}				
		}).then((driver) => {
			driver.save().then(() => {
				console.log("driver saved");
			}).catch((err) => {
				return Promise.reject(err);
			});
		}).catch((err) => {
			console.log("location update failed");
		});
	});
};

DriverSchema.statics.driverOpen = function (params) {
	var Driver = this;
	Driver.findByCode(params.code).then((driver) => {
	 		return new Promise((resolve, reject) => {
	 			if(!driver)	{
	 				console.log("driver not found");
	 				reject();
	 			}
	 			else {
	 				driver.active = true;
	 				console.log("Driver activated");
	 				resolve(driver);
	 			}
	 		}).then((driver) => {
	 			driver.save().then(() => {
	 				console.log("Driver opened");
	 			}).catch((err) => {
	 				return Promise.rct(err);
	 			}); 
	 		}).catch((e) => {
	 			console.log("Driver could not be opened", e);
	 		});
	 	});
};

DriverSchema.statics.driverClose = function(params, callback) {
	var Driver = this;
	return Driver.findByCode(params.code).then((driver) => {
	 	return new Promise((resolve, reject) => {
	 		if(!driver)	{
	 			console.log("driver not found");
				reject();
	 		}
	 		else {
				if(driver.requests.length) { //if op grows, shift callback line below close line and remove pending requests rejection, basically close driver to stop accepting new requests, but tell driver to close pending requests
					callback();
					reject("Pending requests");
				}
				else {
	 				driver.active = false;
	 				console.log("Driver deactivated");
				 	resolve(driver);
				}
	 		}
		}).then((driver) => {
	 		driver.save().then(() => {
				console.log("Driver closed");
				return Promise.resolve();
			}).catch((err) => {
	 			return Promise.reject(err);
	 		}); 
	 	});
	 });
};

function findRequestByRef (requestRef) { // helper function, probably redundant if the function below this uses lodash to purify request obj and then use Request Model functions, refactor only if you are bored and have too much time :) 
	return Request.findByRef(requestRef.request);
}

DriverSchema.methods.findRequests = function() {
	var driver = this;
	var requestRefs = driver.requests;
  	return Promise.all(requestRefs.map(findRequestByRef));
}

DriverSchema.methods.findAndRemoveRequest = function(ref) {
	var driver = this;
	var index = -1;
	var requestRefs = driver.requests;
	
	for(var i = 0 ; i < requestRefs.length; ++i) {
		if(requestRefs[i].request === ref) {
			index = i;
			i = requestRefs.length;
		}
	}

	if(index === -1)
		return Promise.reject("Request ref not found in driver obj");
	requestRefs.splice(index,1);
	return driver.save();
}

var Driver = mongoose.model('Driver', DriverSchema);

module.exports = {Driver};