const mongoose = require("mongoose");
const reminderschema = new mongoose.Schema({
    createdAt:{
        type:Date,
        default:Date.now()
    },
    
})