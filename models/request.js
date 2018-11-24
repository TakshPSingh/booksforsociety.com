var mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

const {User} = require('./user');
const {Driver} = require('./driver');

var RequestSchema = new mongoose.Schema({
	user_ID: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	// address
	status: {
		type: Number,
		required: true
	},
	driver_code: {
		type: Number
	},
	statusInWords: {
		type: String,
		required: true
	},
	createdAt: {
		type: Number,
		required: true
	},
	ETA: {
		type: Number
	},
	ref: {
		type: Number,
		required: true
	},
	address: {
		full: {
			type: String,
			required: true
		},
		location: {
			latitude: {
				type: Number,
				required: true // add bounds
			},
			longitude: {
				type: Number,
				required: true // add bounds
			}
		}
	}
});

RequestSchema.methods.locateDriver = function() {
	var request = this;
	return Driver.findByCode(request.driver_code).then((driver) => {
		console.log("Driver located", driver)
		return new Promise((resolve, reject) => {
			if(!driver.location) {
				return reject("Driver location not found");
			}
			return resolve(driver.location);
		});
	})
};

RequestSchema.statics.findByRef = function(ref) {
	var Request = this;
	return Request.findOne({ref}).then((request) => {
		return new Promise((resolve, reject) => {
			if(!request) {
				return reject("Request not found");
			}
			return resolve(request);
		});
	});
};

var Request = mongoose.model('Request', RequestSchema);

module.exports = {Request};