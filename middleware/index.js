//All middleware
var Campground = require('../models/campground');
var Comment = require('../models/comment');

var middlewareObj = {}
    
middlewareObj.checkCampgroundOwnership = function(req, res, next) {
      if (req.isAuthenticated()) {
        
       Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) {
            req.flash("error", "Something went wrong! :(");
            res.redirect("back");
        } else {
            if (!foundCampground) {
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
            if (foundCampground.author.id.equals(req.user._id)) {
            next();
            } else {
                 req.flash("error", "You don't have permission to do that.");
                 res.redirect("back");
            }
        }
    })

    } else {
        req.flash("error", "You must be logged in to do that.");
        res.redirect("back");
        }
    }

middlewareObj.checkCommentOwnership = function(req, res, next) {
    //Check if logged in
      if (req.isAuthenticated()) {
        
                Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            //Does comment author ID match current user ID
            if (foundComment.author.id.equals(req.user._id)) {
            next();
            } else {
                req.flash("error", "You do not have permission to do that.");
            }
        }
    })

    } else {
        req.flash("error", "You must be logged in to do that.");
        res.redirect("back");
        }
    }
    
middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You must be logged in to do that.");
    res.redirect("/login");
}


middlewareObj.canLike = function(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user_id = req.user._id;
        return next();
    }
    res.json({ status: "failure", msg: "login" })
}

    


module.exports = middlewareObj;