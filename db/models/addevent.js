const mongoose = require("mongoose");
const EventSchema = new mongoose.Schema({
    createdAt:{
        type:Date,
        default:Date.now()
    },
    eventtype:{
        type:String,
        required:true
    },
    eventname:{
        type:String,
        required:true,
    },
    eventdesc:{
        type:String,
        required:true
    },
    eventlocation:{
        type:String
    },
    eventdate:{
        type:Date
    },
    reminderemail:{
        type:String
    },
    reminderdate:{
        type:Date,
    }
})
const AddEvent = new mongoose.model("events",EventSchema);
module.exports = AddEvent;