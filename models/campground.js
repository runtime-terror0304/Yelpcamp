const mongoose = require('mongoose');

const campgroundSchema = new mongoose.Schema({
    title:{
        type: String
    },
    price:{
        type: String
    },
    description:{
        type: String
    },
    location:{
        type: String
    }
});

module.exports = new mongoose.model('Campground', campgroundSchema);