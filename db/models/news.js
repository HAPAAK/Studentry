const mongoose = require("mongoose");
const newsSchema = new mongoose.Schema({
    news:{
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    img:{
        type:String
    },
    newsurl:{
        type:String,
    }
})
const News = new mongoose.model("news",newsSchema);
module.exports = News;