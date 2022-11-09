const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    createdBy: {
        type:String,
        required: true
    },
    createdAt:{
        type:Date,
        unique:true
    },
    img:{
        type:String,
        required:true
    },
    question:{
        type:String,
        required: true
    },
    answer:{
        type:String,
        required:true
    }
})

const AdminSchema = new mongoose.model("todayquestions",QuestionSchema);
module.exports= AdminSchema;