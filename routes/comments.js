var express = require('express');
var router = express.Router({mergeParams: true});
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middleware = require('../middleware/index');


//======= COMMENT ROUTES ========

//NEW Comment form
router.get("/new", middleware.isLoggedIn, function(req, res) {
    var campground = Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { campground: campground});
        }
    })

});

//CREATE comment and save
router.post("/", middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) {
            req.flash("error", "Something went wrong! :(");
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err, newComment) {
                if (err) {
                    console.log(err);
                } else {
                    //add username/ID to comment
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    newComment.save();
                    foundCampground.comments.push(newComment);
                    foundCampground.save();
                    req.flash("success", "Successfully posted comment!");
                    res.redirect("/campgrounds/" + foundCampground._id );
                }
            })
        }
    })
});

//EDIT comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    })
    
});

//UPDATE comment
router.put("/:comment_id", function(req, res) {
   Comment.findOneAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id)
        }
    })
    
});

//DELETE Comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findOneAndDelete({ _id: req.params.comment_id }, function(err) {
        if (err) {
            req.flash("error", "Something went wrong! :(");
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted!");
            console.log(req.params.comment_id);
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

//POST Add like to a comment
router.post("/:comment_id/like", middleware.canLike, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err || !foundComment) {
            req.flash("error", "Comment not found");
            res.redirect("back");
        } else {
            if (foundComment.likes.filter(like => like.user.toString() === res.locals.user_id.toString())
            .length > 0) {
                // req.flash("error", "User has already liked this post.");
                // res.redirect("back");
                res.json({ status: "failure" });
            } else {
                foundComment.likes.unshift({ user: req.user._id });
                foundComment.save();
                const newLikes = foundComment.likes.length;
                res.json({status: "success", newLikes: newLikes});
                console.log(res.locals.user_id);
            }
        }
    })
})



module.exports = router;
