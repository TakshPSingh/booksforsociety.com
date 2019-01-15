var mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

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
	ATA: {
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
				required: true // add bounds, not required anymore, thanks to Google Maps
			},
			longitude: {
				type: Number,
				required: true // add bounds, not required anymore, thanks to Google Maps
			}
		}
	},
	books: [{
		grade: {
			type: Number,
			required: true,
			min: 6,
			max: 12
		},
		subject: {
			type: String,
			required: true
		}
	}]
});

RequestSchema.methods.completeRequest = function() {
	var request = this;
	request.ATA = new Date().getTime();
	request.status = 2;
	request.statusInWords = 'Picked up';
	return request.save();
};

RequestSchema.statics.findByRef = function(ref) {
	var Request = this;
	return Request.findOne({ref}).then((request) => {
		return new Promise((resolve, reject) => {
			if(!request) {
				return reject("Request not found");
			}
			console.log("Request found");
			return resolve(request);
		});
	});
};

var Request = mongoose.model('Request', RequestSchema);

module.exports = {Request};