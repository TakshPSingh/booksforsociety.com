const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var NGOSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1
  },
  demand: [{
    grade: {
			type: Number,
			required: true,
			min: 6,
			max: 12
    },
    numberOfBooksRequired: {
      type: Number,
      required: true
    }
  }]
});

NGOSchema.methods.toJSON = function () {
  var ngo = this;
  var NGOObject = ngo.toObject();

  return NGOObject;
};

NGOSchema.statics.findByName = function(name) {
  var NGO = this;
  return NGO.findOne({
    name: name
  });
};

NGOSchema.methods.decreaseDemand = function (grade) {
  var ngo = this;
  ngo.demand[grade-6].numberOfBooksRequired--;
  return ngo.save();
};

var NGO = mongoose.model('NGO', NGOSchema);

module.exports = {NGO};