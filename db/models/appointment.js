const mongoose = require("mongoose");
const AppointmentSchema = new mongoose.Schema({
    createdBy:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    venue:{
        type:String,
        required:true
    },
    venue_type:{
       type:String,
       required:true 
    },
    instruction:{
        type:String
    },
    beneficiary:{
        type:String,
        required:true
    }
})
const Appointment = new mongoose.model("appointments",AppointmentSchema);
module.exports = Appointment;
