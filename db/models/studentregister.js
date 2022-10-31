const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
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
    age:{
        type:Number,
        required:true
    },
    registration_number:{
        type:String,
        unique:true,
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
    }
})

const StudentRegister = new mongoose.model("studentregisters",StudentSchema);

module.exports= StudentRegister;