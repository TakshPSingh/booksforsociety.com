var {User} = require('../models/user');

var authenticate = (token) => {
	User.findByToken(token).then((user) => {
		if(!user) {
			return Promise.reject();
		}

		return {
			email: user.email,
			name: user.name
		};
	})
};

module.exports = {authenticate};