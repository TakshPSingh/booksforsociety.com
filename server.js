require('./config/config.js');

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const publicPath = path.join(__dirname, './public');

var {mongoose} = require('./db/mongoose');
const {validateEmail, validateName, validatePassword} = require('./utils/validation');
const {generateLocationMessage} = require('./utils/location-message');
const {authenticate} = require('./utils/authenticate');
const {locationServiceable} = require('./utils/location-serviceable');
const {assign} = require('./utils/assign');
const {emailPickupConfirmation, emailAssignmentConfirmation} = require('./utils/email');

//importing models
const {User} = require('./models/user');
const {Driver} = require('./models/driver');
const {Request} = require('./models/request');
const {Total} = require('./models/total');

const port = process.env.PORT;

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
			 callback();
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

	 socket.on('resetPassword', (params) => {
		authenticate(params.token).then((user) => {
			user.password = params.password;
			return user.save();
		}).catch((err) => {
			console.log("Err:",err);
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
		 var user,requestCreated,assignedDriver;

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
		 }).then((driver) => {
			 assignedDriver = driver;
			 return Request.findByRef(requestCreated.ref);
		 }).then((request) => {
			return emailAssignmentConfirmation(user, request, assignedDriver, sgMail);
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

	socket.on('driverClose', (params, callback) => {
		Driver.driverClose(params, callback).then(() => {
			socket.emit('driverClosed');
		}).catch((err) => {
			console.log("err:",err);
		});
	});

	socket.on('driverLocationUpdate', (params) => {
	   Driver.driverLocationUpdate(params);	 	
	});

	socket.on('driverRequests', (params) => { // add phone number if the app flies off and also potentially add name too for better user experience but ony if the app works really really well
		Driver.findByCode(params.code).then((driver) => {
			return driver.findRequests();
		}).then((requests) => {
			socket.emit('driverRequestsReturning', {requests});
		}).catch((err) => {
			console.log("Err:",err);
		});
	});

	socket.on('pickupDone', (params,callback) => {
		var ref,req,dri;

		Driver.findByCode(params.code).then((driver) => {
			ref = driver.requests[0].request;
			return driver.findAndRemoveRequest(ref)
		}).then((driver) => {
			dri=driver;
			return Request.findByRef(ref);
		}).then((request) => {
			return request.completeRequest();
		}).then((request) => {
			req=request;
			return User.findById(request.user_ID);
		}).then((user) => {
			user.active = false;
			return user.save();
		}).then((user) => {
			return emailPickupConfirmation(user,req,dri,sgMail);
		}).then(() => {
			callback();
		}).catch((err) => {
			console.log("Err:", err);
		}); 
	});
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});

var driver = new Driver({
		code: 99,
		active: false,
		vehicle: 'DL10CE2408',
		name: 'Shailendra',
		phone: 12345678910
	});
	driver.save().then(() => {
		console.log("driver saved");
	}).catch((err) => {
		console.log("driver save failed", err);
	})