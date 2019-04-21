const mongoose = require('mongoose');

//Set up schema
var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
   comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
        ],
     ratings: [
         {
         user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
         },
         score: {
             type: Number,
             min: [1, "They get at least 1 just for existing"],
             max: [5, "Woah woah, I'm sure it's great but 5 is the max here"]
         }
         }
         ]
});

module.exports = mongoose.model("Campground", campgroundSchema);