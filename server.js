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

const port = process.env.PORT || 3000;

var app = express();
app.use(express.static(publicPath));

var server = http.createServer(app);
var io = socketIO(server);

io.on('connection', (socket) => {

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