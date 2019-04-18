var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var middleware = require('../middleware/index');
var NodeGeocoder = require('node-geocoder');

var geocodeOptions = {
  provider: 'google',

  httpAdapter: 'https', // Default
  apiKey: process.env.GEOCODER_API_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null 
};

var geocoder = NodeGeocoder(geocodeOptions);

//INDEX
router.get("/", function(req, res) {
  Campground.find({}, function(err, campgrounds) {
      if (err) {
          console.log(err);
      } else {
          res.render("campgrounds/index", {campgrounds: campgrounds, currentUser: req.user});
      }
  })

});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});

//NEW - Show form to create new entry
router.get('/new', middleware.isLoggedIn, function(req, res) {
    res.render('campgrounds/new');
})

//SHOW details of one campground
router.get("/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, result) {
        if (err) {
            console.log(err);
        } else {

            res.render("campgrounds/show", { campground: result });
        }
    });

});

//EDIT form
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {

    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err || !foundCampground) {
            req.flash('error', 'Campground not found');
            return res.redirect('back');
        }
        res.render("campgrounds/edit", {campground: foundCampground});
        })
    });

//UPDATE campground
/*router.put("/:id", function(req, res) {

    Campground.findOneAndUpdate(req.params.id, req.body.campground, function(err, updatedCamp) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id)
        }
    })
    
});
*/
// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findOneAndUpdate({ _id: req.params.id }, req.body.campground, function(err, campground){
        if(err || !campground){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

//DESTROY
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findOneAndDelete(req.params.id, function(err) {
        if (err) {
            res.redirect("/campgrounds")
        } else {
            res.redirect("/campgrounds")
        }
    })
});



module.exports = router;