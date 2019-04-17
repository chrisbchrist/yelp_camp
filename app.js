require('dotenv').config();
const express = require("express"),
      ejs = require("ejs"),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      Campground = require('./models/campground.js'),
      Comment = require('./models/comment.js'),
      User = require('./models/user'),
      seedDB = require("./seeds"),
      passport = require('passport'),
      LocalStrategy = require('passport-local'),
      methodOverride = require('method-override'),
      flash = require('connect-flash'),
      NodeGeocoder = require('node-geocoder');
      
      var campgroundRoutes = require('./routes/campgrounds'),
      commentRoutes = require('./routes/comments'),
       indexRoutes = require('./routes/index');
      
/*var geocodeOptions = {
  provider: 'google',

  httpAdapter: 'https', // Default
  apiKey: process.env.GEOCODER_API_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};
*/
var app = express();
mongoose.connect(process.env.DATABASEURL || "mongodb://localhost/yelp_camp",  { useNewUrlParser: true });
//mongoose.connect("mongodb://admin:yelpcamp1@ds131697.mlab.com:31697/yelp_camp",  { useNewUrlParser: true });

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(require('express-session')({
    secret: "I heard that there is practically no pork in Anaheim",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    //Gives views access to current user object when page is rendered
    res.locals.currentUser = req.user;
    next();
});

app.use(function(req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})

//seedDB();


app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Yelp Camp is listening!! :D");
});