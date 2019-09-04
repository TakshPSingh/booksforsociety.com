//All user and driver test PASSING
//Request test PASSING
//previous request fetch finally PASSING thanks to Promise.all() :)
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, './public');

var {mongoose} = require('./db/mongoose');
const {validateEmail, validateName, validatePassword} = require('./utils/validation');
const {generateLocationMessage} = require('./utils/location-message');
const {authenticate} = require('./utils/authenticate');

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

// Request.findByRef(1651).then((req) => {
// 	console.log("Req found",req);
// }).catch((err) => {
// 	console.log("err",err);
// })

io.on('connection', (socket) => {

	console.log("New user connected");

	//code to create and save a new driver obj in the DB

	// var driver = new Driver({
	// 	code: 99,
	// 	active: false,
	// 	vehicle: 'DL10CE2408',
	// 	name: 'Shailendra',
	// 	phone: 12345678910
	// });
	// driver.save().then(() => {
	// 	console.log("driver saved");
	// }).catch((err) => {
	// 	console.log("driver save failed", err);
	// })

	// code to create and save a new request obj in the DB
	// var request = new Request({
	// 	user_ID: '5bec34cf969f2503c89c83aa',
	// 	status: 0,
	// 	driver_code: 99,
	// 	statusInWords: 'Pending',
	// 	createdAt: new Date().getTime(),
	// 	ref: 1234,
	// 	address: {
	// 		full: 'random house address 2',
	// 		location: {
	// 			latitude: 1111,
	// 			longitude: 2222
	// 		}
	// 	}
	// });
	// request.save().then(() => {
	// 	console.log("saved test request");
	// }).catch((err) => {
	// 	console.log("request save failed");
	// })

	// code for test driverLocationUpdate
	// Driver.driverLocationUpdate({code: 99, location: {
	// 	latitude: 123,
	// 	longitude: 456
	// }}).then((driver) => {
	// 	console.log("Driver:", driver);
	// }).catch((err) => {
	// 	console.log("driver location update failed");
	// });

	// Request.findByRef(123).then((request) => {
	// 	console.log("request found:", request);
	// }).catch((err) => {
	// 	console.log("Request missing:", err);
	// });

	// Request.findByRef(123).then((request) => {
	// 	return request.locateDriver();
	// }).then((location) => {
	// 	console.log("Location found",location);
	// }).catch((err) => {
	// 	console.log("error:",err);
	// });

	socket.on('findPreviousRequests', (params) => {
		authenticate(params.token).then((user) => {
		   console.log("authenticated");
		   return user.findPreviousRequests();
		}).then((previousRequests) => {
			console.log("previosRequests:",previousRequests);
		    socket.emit('previousRequests',previousRequests);
		}).catch((err) => {
			console.log('err:', err);
		});
	});

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

	 socket.on('driverOpen', (params) => {
	 	Driver.driverOpen(params);
	 });

	 socket.on('driverClose', (params) => {
	 	Driver.driverClose(params);
	 });

	 socket.on('driverLocationUpdate', (params) => {
		Driver.updateDriverLocation(params);	 	
	 });	
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
