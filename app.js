const express = require('express');
const path = require('path');
const catchAsync = require('./utils/catchAsync');
const expressError = require('./utils/expressError');
const Review = require('./models/review');
const {campgroundSchema} = require('./schemas');
const {reviewSchema} = require('./schemas');
const Joi = require('joi');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log('Mongo Database Connection Established!');
})
.catch((err) => {
    console.log('Mongo Connection Could Not Be Established!');
    console.log(err);
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400);
    }
    else
    {
        next();
    }
}

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error)
    {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400);
    }
    else{
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', {campground});
}))

// function wrapAsync(fun){
//     return (req, res, next) => {
//         fun(req, res, next).catch((err) => {
//             next(err);
//         })
//     }
// }

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground)
    // {
    //     throw new expressError('Invalid campground data', 400);
    // }
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}))

app.put('/campgrounds/:id', validateCampground,catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

//review routes--------------------------
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${id}`);
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res, next) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull : {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

// or here, we could have done for the 404 path...
// app.use((req, res, next) => {
//     res.send('404 Not found!');
// })

//the 404 path
app.all('*', (req, res, next) => {
    throw new expressError('Page Not Found!', 404);
})

app.use((err, req, res, next) => {
    const {status = 500} = err; 
    if(!err.message)
    {
        err.message = "Something went wrong!";
    }
    res.status(status).render('error', {err});
})

app.listen('3000', () => {
    console.log('Serving on port 3000');
});