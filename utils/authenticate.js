var {User} = require('../models/user');

var authenticate = (token) => {
	return new Promise((resolve, reject) => {
		User.findByToken(token).then((user) => {
			if(!user)
				return reject();
			resolve(user);
		}).catch((err) => {
			reject();
		});
	});
};

module.exports = {authenticate};