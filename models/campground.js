const mongoose = require('mongoose');
const Review = require('./review');

const campgroundSchema = new mongoose.Schema({
    title: {
        type: String
    },
    image: {
        type: String
    },
    price: {
        type: Number
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: Review
        }
    ]
});

//here this is a query middleware that is, in here, the value of this keyword will be equal to the query.
campgroundSchema.post('findOneAndDelete', async function(doc){
    //yeh post middleware hai...yaha pe jo bhi object affect hota hai woh 'doc' mei aa jata hai.

    //agar kuch delete hua hai tabhi karna hai yeh..
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = new mongoose.model('Campground', campgroundSchema);