const mongoose = require("mongoose");
const reminderschema = new mongoose.Schema({
    createdAt:{
        type:Date,
        default:Date.now()
    },
    reminderdate:{
        type:Date,
        required:true
    },
    remindertype:{
        type:String,
        required:true
    },
    createdBy:{
        type:String,
        required:true
    },
    beneficiaryemail:{
        type:String,
        required:true
    },
    events:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"events"
    },
    appointment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"appointments"
    }
})
const Allreminder = new mongoose.model("reminders",reminderschema);
module.exports = Allreminder;