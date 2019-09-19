const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const {Request} = require('./request');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 3
  },
  name: {
    type: String,
    required: true,
    minlength: 1
  },
  requests: [ {
    request: {
      type: Number
      }
  }],
  phone: {
    type: String,
    required: true,
    minlength: 10
  },
  active: {
    type: Boolean,
    default: false
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email', 'phone', 'name']);
};

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'fsjfkjsafjksfjksjf').toString();

  user.tokens = user.tokens.concat([{access, token}]);

  return user.save().then(() => {
    return token;
  });
};

function findRequestByRef (requestRef) { // helper function, probably redundant if the function below this uses lodash to purify request obj and then use Request Model functions, refactor only if you are bored and have too much time :) 
  return Request.findByRef(requestRef.request);
}

UserSchema.methods.findPreviousRequests = function () {
  var user = this;
  var requestRefs = user.requests;
  return Promise.all(requestRefs.map(findRequestByRef));
};

UserSchema.methods.findCurrentRequest = function () {
  var user = this;
  var requestRefs = user.requests;
  var request = requestRefs[requestRefs.length - 1];

  console.log("request", request);
  console.log("inside current req function");
  return Request.findByRef(request.request);
};

UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, // enter key here);
  } catch (e) {
    console.log("jwt token error:",e);
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;
  //console.log(User);
  return User.findOne( {email} ).then((user) => {
    console.log("user", user);
    if (!user) {
    	//console.log("user not found, triggering promise reject");
      return Promise.reject();
    }
   // console.log("user found");
    return new Promise((resolve, reject) => {
      // Use bcrypt.compare to compare password and user.password
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
        	//console.log("correct pass");
          resolve(user);
        } else {
        	//console.log("wrong pass");
          reject();
        }
      });
    });
  });
};

UserSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    console.log("there, again");
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});



var User = mongoose.model('User', UserSchema);

module.exports = {User};
