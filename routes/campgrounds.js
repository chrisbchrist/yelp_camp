var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var middleware = require('../middleware/index');



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
//CREATE - Submit entry to DB
router.post("/", middleware.isLoggedIn, function(req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var price = req.body.price;
    var author = { id: req.user._id, username: req.user.username }
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
    
    //Create new camp and save to DB
    Campground.create(newCampground, function(err, newCamp) {
        if (err) {
            console.log(err);
        } else {
             res.redirect("campgrounds");
        }
    })

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
        res.render("campgrounds/edit", {campground: foundCampground});
        })
    });

//UPDATE campground
router.put("/:id", function(req, res) {

    Campground.findOneAndUpdate(req.params.id, req.body.campground, function(err, updatedCamp) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id)
        }
    })
    
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