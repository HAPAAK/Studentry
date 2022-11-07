const mongoose = require('mongoose');

const CounsellorSchema = new mongoose.Schema({
    firstname: {
        type:String,
        required: true
    },
    middlename:{
        type:String
    },
    lastname:{
        type:String,
        required: true
    },
    gender:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    designation:{
        type:String
    },
    summary:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phone_number:{
        type:String,
        required:true,
        unique:true
    },
    createdAt:{
        type:Date,
        default: Date.now
    },
    img:{
      type:String,
      required:true  
    },
    students:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"studentregisters"
    }]
})

const CounsellorRegister = new mongoose.model("counsellorregisters",CounsellorSchema);

module.exports= CounsellorRegister;