const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
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

UserSchema.methods.toJSON = function () {
  var driver = this;
  var driverObject = driver.toObject();

  return _.pick(driverObject, ['_id', 'phone', 'vehicle', 'name']);
};

UserSchema.statics.findByCode = function (code) {
  var Driver = this;
  return Driver.findOne({code});
};

UserSchema.methods.locate = function() {
	var driver = this;
	return driver.location;
};

UserSchema.statics.driverLocationUpdate = function(params) {
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

UserSchema.statics.driverOpen = function (params) {
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
	 				return Promise.reject(err);
	 			}); 
	 		}).catch((e) => {
	 			console.log("Driver could not be opened", e);
	 		});
	 	});
};

UserSchema.statics.driverClose = function(params) {
	var Driver = this;
	Driver.findByCode(params.code).then((driver) => {
	 	return new Promise((resolve, reject) => {
	 		if(!driver)	{
	 			console.log("driver not found");
				reject();
	 		}
	 		else {
	 			driver.active = false;
	 			console.log("Driver deactivated");
	 			resolve(driver);
	 		}
		}).then((driver) => {
	 		driver.save().then(() => {
	 			console.log("Driver closed");
	 		}).catch((err) => {
	 			return Promise.reject(err);
	 		}); 
	 	}).catch((e) => {
	 		console.log("Driver could not be closed", e);
	 	});	
	 });
};

var Driver = mongoose.model('Driver', UserSchema);

module.exports = {Driver};