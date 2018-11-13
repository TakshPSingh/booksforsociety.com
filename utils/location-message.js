var moment = require('moment');

var generateLocationMessage = (latitude, longitude) => {
	return {
		latitude,
		longitude,
		createdAt: moment().valueOf()
	}
}; 

module.exports = {generateLocationMessage};