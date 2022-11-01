const mongoose = require("mongoose");
const ForumSchema = new mongoose.Schema({
    forumtopic:{
        type:String,
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    comment:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"comments"
    }]
})
const Forum = new mongoose.model("forums",ForumSchema);
module.exports = Forum;