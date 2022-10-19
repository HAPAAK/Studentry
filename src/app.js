// const result = require('../template');

// console.log(result);
// console.log(new result.Practise);
// console.log("hello world from node js");

const express = require('express');
const path = require('path');
const app = express();
const hbs = require('hbs');
const port = process.env.PORT || 3000;
const db =  require('./db/conn.js');

const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../template/views");
const partial_path = path.join(__dirname, "../template/partials");
//app.use(express.static(static_path));
// app.get("/",(_req,res)=> {
//     res.send("Sorry, the server is down");
// });
app.set("view engine","hbs");
app.set("views",template_path);
hbs.registerPartials(partial_path);

app.get("/",(_req,res)=> {
    res.render("index");
});
app.get(".register",(req,res)=>{
    res.render("register");
})
app.listen(port,()=>{
    console.log(`Listening at port ${port} `);
})