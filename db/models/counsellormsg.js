const mongoose = require("mongoose");
const counsellormsgschema = new mongoose.Schema({
    createdAt:{
        type:Date,
        default:Date.now()
    },
    context:{
        type:String,
        required:true
    },
    By:{
        type:String,
        required:true
    },
    from:{
        type:String,
        required:true
    }
})
const CounsellorMsg = new mongoose.model("counsellormsg",counsellormsgschema);
module.exports = CounsellorMsg;