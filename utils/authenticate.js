var {User} = require('../models/user');

var authenticate = (token) => {
	return new Promise((resolve, reject) => {
		User.findByToken(token).then((user) => {
			if(!user)
				return reject("user not found");
			resolve(user);
		}).catch((err) => {
			reject("Unknown error inside findByToken");
		});
	});
};

module.exports = {authenticate};