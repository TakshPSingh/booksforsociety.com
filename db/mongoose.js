var mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/Booksforsociety"); //enter location here

module.exports = {mongoose};