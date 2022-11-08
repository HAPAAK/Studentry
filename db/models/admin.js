const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
})
const Admins = new mongoose.model("admins",AdminSchema);
module.exports= Admins;