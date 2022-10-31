const mongoose = require("mongoose");
const UserEventSchema = new mongoose.Schema({
    regno:{
        type:String,
        required:true
    },
    events:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"events"
        }
    ]
})
const UserEvent = new mongoose.model("userevents",UserEventSchema);
module.exports = UserEvent;