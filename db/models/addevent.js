const mongoose = require("mongoose");
const EventSchema = new mongoose.Schema({
    createdAt:{
        type:Date,
        default:Date.now()
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
    }
})
const AddEvent = new mongoose.model("events",EventSchema);
module.exports = AddEvent;