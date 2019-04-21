var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

//root
router.get("/", function(req, res) {
    res.render("landing")
});

//Authorization Routes

//Registration form
router.get("/register", function(req, res) {
   res.render("register"); 
});

//Create user
router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("register");
        }
        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Welcome to YelpCamp, " + user.username + "! :D");
            res.redirect("/campgrounds");
        })
    })
});

//Login form
router.get("/login", function(req, res) {
    res.render("login");
})

//Login
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: "Invalid username or password"
}), function(req, res) {
   req.flash("error", "Something");
});

//logout
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "You're logged out!");
    res.redirect("/");
})

module.exports = router;