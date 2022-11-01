const mongoose = require("mongoose");
const forumcommentSchema = new mongoose.Schema({
    regno:{
        type:String,
        required:true,
        unique:true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    content:{
        type:String
    }
})
const Comments = new mongoose.model("comments",forumcommentSchema);
module.exports = Comments;