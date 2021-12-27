const mongoose = require('mongoose');

const campgroundSchema = new mongoose.Schema({
    title:{
        type: String
    },
    image: {
        type: String
    },
    price:{
        type: Number
    },
    description:{
        type: String
    },
    location:{
        type: String
    }
});

module.exports = new mongoose.model('Campground', campgroundSchema);