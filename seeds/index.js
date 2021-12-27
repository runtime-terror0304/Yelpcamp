const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true}).
then(() => {
    console.log('Seed file connected to mongo');
})
.catch((err) => {
    console.log('Seed file mongo connection error!');
    console.log(err);
});

const sample = (array) => {
    return array[Math.floor(Math.random()*array.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0; i<50; i++)
    {
        const loc = sample(cities);
        const price = Math.floor(Math.random()*20) + 10
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${loc.city}, ${loc.state}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Temporibus inventore magni debitis possimus voluptates, sed, ipsa aperiam alias eum nobis nisi, nam perferendis. A soluta at quibusdam, atque dolores aspernatur',
            price
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    console.log('Campgrounds populated successfully!');
    mongoose.connection.close();
})
.catch((err) => {
    console.log('Campground Population failed!');
    console.log(err);
});