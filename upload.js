const multer = require('multer');
const path  = require("path");
//defining storage location and how to upload using multer
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"././uploads");
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
})
const upload = multer({
    storage:storage,
    fileFilter:function(req,file,callback) {
        if(
            file.mimetype=="image/png" || file.mimetype=="image/jpg"
        ){
            callback(null,true);
        }else{
            console.log("Only jpg or png allowed");
            callback(null,false);
        }
    }
});

module.exports = upload;
let he ="change";