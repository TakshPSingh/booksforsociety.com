var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/Booksforsociety"); //enter location here

module.exports = {mongoose};