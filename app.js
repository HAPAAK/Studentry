// const result = require('../template');

// console.log(result);
// console.log(new result.Practise);
// console.log("hello world from node js");
// const template_path = path.join(__dirname,"../template/views");
// const partial_path = path.join(__dirname, "../template/partials");
const express = require('express');
const path = require('path');
const app = express();

//define dynamic port
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//bind the static path to public directory
const static_path = path.join(__dirname,"public");
require('ejs');
app.set("view engine","ejs");
app.use(express.static(static_path));

//database part
const db =  require('./db/conn.js');

let username = "";
let password = "";
let email = "";
let cname = "";
let failure = false;
let msg = "";
let loggedIn = false;



app.get("/",(_req,res)=> {
    res.render("index");
});


app.get("/studentlogin",(req,res)=>{
    console.log("Request for student register received");
    loggedIn = false;
    res.render("studentlogin",{failure: failure,msg:msg});
    failure = false;
    msg = "";
})

//creating a new user in the database
const StudentRegister = require("./db/models/studentregister");
app.post("/studentregister",async(req,res)=>{
    try{
        const registerStudent = new StudentRegister({
            firstname:req.body.fname,
            midddlename:req.body.mname,
            lastname:req.body.lname,
            age:req.body.age,
            registration_number:req.body.regno, 
            email:req.body.email,
            password:req.body.password,
            phone_number:req.body.phno
           
        })
        const stu_registered = await registerStudent.save();
        res.status(201).render("index");
    }catch(error){
        res.status(400).send(error);
    }
})
app.get("/counsellor-login",(req,res)=>{
    res.render("student-login");
})

app.listen(port,()=>{
    console.log(`Listening at port ${port} `);
})