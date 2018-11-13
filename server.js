const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, './public');

const {validateEmail, validateName, validatePassword} = require('./utils/validation');
const {generateLocationMessage} = require('./utils/location-message');
const {authenticate} = require('./utils/authenticate');
const {User} = require('./models/user');

console.log("user model found");

const port = process.env.PORT || 3000;

var app = express();
app.use(express.static(publicPath));

var server = http.createServer(app);
var io = socketIO(server);

io.on('connection', (socket) => {
	 console.log('New user connected');

	 socket.on('login', (params, callback) => {
	 	console.log("login process start triggered");
	 	console.log(params);
	 	User.findByCredentials(params.email, params.password).then((user) => {
	 		return user.generateAuthToken().then((token) => {
	 			console.log("triggered gen auth token", token);
	 			return socket.emit('token', token);
	 		}).catch((err) => {
	 			console.log("Authentication failed")
	 		});
	 	});
	 });

	 socket.on('checkToken', (params,callback) => {

	 	User.authenticate(params.token).then((user) => {
	 		socket.emit('tokenVerified', user);
		}).catch((e) => {
 			callback("Authentication failed");
	 	});
	 });

	 socket.on('register', (params, callback) => {
	 	var user = new User({
	 		email: params.email,
	 		password: params.password,
	 		name: params.name
	 	});

	 	user.save().then((savedUser) => {
	 		socket.emit('registered', params);
	 	}).catch((err) => {
	 		callback("Please check that you are entering valid email, password and name");
	 	});
	 });
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});