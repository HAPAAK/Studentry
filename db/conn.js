const mongoose = require('mongoose');
const url ="mongodb+srv://resham:sapkota@cluster0.pjitpto.mongodb.net/?retryWrites=true&w=majority";

const connectionParameter={
    useNewUrlParser:true,
    useUnifiedTopology:true,
    //useCreateIndex:true
}
mongoose.connect(url,connectionParameter)
.then(()=>{
    console.log("connection successful");
}).catch((e)=>{
    console.log("no connection {}",e);
})

