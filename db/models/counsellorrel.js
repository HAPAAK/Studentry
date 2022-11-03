const mongoose = require("mongoose");
const counsellorrelschema = new mongoose.Schema({
    regno:{
        type:String,
        unique:true
    },
    messages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"counsellormsg"
    }]
})
const CounsellorRel = new mongoose.model("counsellorrel",counsellorrelschema);
module.exports = CounsellorRel;