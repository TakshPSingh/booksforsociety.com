const mongoose = require('mongoose');
const validator = require('validator');

var TotalSchema = new mongoose.Schema({
    reference: {
        type: Number,
        required: true
    },
    count: {
        type: Number,
        required: true
    }
});

TotalSchema.statics.increase = function(amount) {
    var Total = this;
    return Total.findOne({reference: 1}).then((total) => {
        total.count += amount;
        return total.save();
    });
}
var Total = mongoose.model('Total', TotalSchema);

module.exports = {Total};