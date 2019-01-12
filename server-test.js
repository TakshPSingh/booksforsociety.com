const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, './public');

var {mongoose} = require('./db/mongoose');
const {validateEmail, validateName, validatePassword} = require('./utils/validation');
const {generateLocationMessage} = require('./utils/location-message');
const {authenticate} = require('./utils/authenticate');
const {locationServiceable} = require('./utils/location-serviceable');
const {assign} = require('./utils/assign');
const {emailPickupConfirmation} = require('./utils/email').default;

//importing models
const {User} = require('./models/user');
const {Driver} = require('./models/driver');
const {Request} = require('./models/request');
const {Total} = require('./models/total');

const port = process.env.PORT || 3000;

var app = express();
app.use(express.static(publicPath));

var server = http.createServer(app);
var io = socketIO(server);

io.on('connection', (socket) => {
     console.log("new user connected");
    
	 socket.on('login', (params, callback) => {
	 	User.findByCredentials(params.email, params.password).then((user) => {
	 		return user.generateAuthToken();
	 	}).then((token) => {
	 			return socket.emit('token', token);
	 	}).catch((err) => {
	 		console.log("error", err);
	 	});
	 });

	 socket.on('checkToken', (params,callback) => {
	 authenticate(params.token).then((user) => {
	 		socket.emit('tokenVerified', user);
		}).catch((e) => {
 			console.log("Authentication failed");
	 	});
	 });

	 socket.on('register', (params) => {
	 	var user = new User({
	 		email: params.email,
	 		password: params.password,
	 		name: params.name,
	 		phone: params.phone
	 	});

	 	user.save().then(() => {
	 		return user.generateAuthToken();
	 	}).then((token) => {
	 		socket.emit('registered', token);
	 	}).catch((err) => {
	 		console.log("User saving failed", err);
	 	});
	 });

	 socket.on('findPreviousRequests', (params) => {
		 authenticate(params.token).then((user) => {
			return user.findPreviousRequests();
		 }).then((previousRequests) => {
			socket.emit('previousRequests',previousRequests);
		 });
	 });

	 socket.on('newRequest', (params) => {
		 var user,requestCreated;

		 authenticate(params.token).then((tempUser) => {
			user = tempUser;
			console.log("user",user); 
			if(user.active)
				return Promise.reject("user already has pending requests");	
			
			return locationServiceable(params.address.location);
		 }).then(() => {
			var request = new Request(params);

			request.status = 0;
			request.statusInWords = "Unassigned";
			request.user_ID = user._id;
			request.createdAt = new Date().getTime();

			return Total.increase(7).then((total) => {
				request.ref = total.count;
				return request.save();
			})
		 }).then((request) => {
			
			requestCreated = request;
			return assign(request,user);
		 }).catch((err) => {
             console.log("err:",err);
			 socket.emit('newRequestFailed', {err});
		 })
	 });

	 socket.on('getRequestStatus', (params) => {
		var currentRequest;

		authenticate(params.token).then((user) => {
			if(!user.active)
				return Promise.reject("inactive");

			return user.findCurrentRequest();
		}).then((request) => {
			currentRequest = request;
			return Driver.findByCode(request.driver_code);
		}).then((driver) => {
			socket.emit('sendRequestStatus', {
				request: currentRequest, driver
			});
		}).catch((err) => {
			socket.emit(err);
		});
	 });

	 socket.on('driverOpen', (params) => {
		Driver.driverOpen(params);
	});

	socket.on('driverClose', (params) => {
		Driver.driverClose(params);
	});

	socket.on('driverLocationUpdate', (params) => {
	   Driver.driverLocationUpdate(params);	 	
	});

	socket.on('driverRequests', (params) => {
		Driver.findByCode(params.code).then((driver) => {
			return driver.findRequests();
		}).then((requests) => {
			console.log("requests", requests);
			socket.emit('driverRequests', {requests});
		}).catch((err) => {
			console.log("err", err);
		});
	});

	socket.on('pickupDone', (params) => {
		Driver.findByCode(params.code).then((driver) => {
			console.log("Driver found");
			return driver.findAndRemoveRequest(params.ref);
		}).then((driver) => {
			console.log("request removed from driver");
			return Request.findByRef(params.ref);
		}).then((request) => {
			console.log("Request discovered");
			return request.completeRequest();
		}).then((request) => {
			console.log("Request set to completed");
			return User.findById(request.user_ID);
		}).then((user) => {
			console.log("User found");
			user.requests.pop();
			user.active = false;
			console.log("Request debinded from user");
			return user.save();
		}).then((user) => {
			console.log("user saved, emailing now"); // refactor to create new function in user obj to pop request as well as save it, if you have time :)
			return emailPickupConfirmation(user);
		}).catch((err) => {
			console.log("Err:", err);
		}); 
	});
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});