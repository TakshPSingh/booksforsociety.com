var mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

const {NGO} = require('./ngo');

var RequestSchema = new mongoose.Schema({
	user_ID: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	user_phone: {
		type: Number,
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
	NGO: {
		type: String
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
			enum: ['English','Math','Science','Computer Science','History','Geography','Political Science','Civics','Hindi','Other relevant subject'],
			required: true
		}
	}]
});

RequestSchema.methods.toJSON = function () {
	var request = this;
	var requestObject = request.toObject();
  
	return _.omit(requestObject, ['driver_code']);
	//this might need to be replaced with _.pick for speed if project scales enough
  };

RequestSchema.methods.completeRequest = function() {
	var request = this;
	request.ATA = new Date().getTime();
	request.status = 2;
	request.statusInWords = 'Picked up';
	return NGO.findByName(request.NGO).then((ngo) => {
		console.log("NGO found");

		for(var i = 0; i < request.books.length; ++i) {
			var grade = request.books[i].grade;
			ngo.demand[grade-6].numberOfBooksRequired--;
		}//shift this to ngo.js if you have time
		return ngo.save();
	}).then((ngo) => {
		console.log("About to save request after decreasing NGO demand");
		return request.save();
	});
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