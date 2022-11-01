// const result = require('../template');

// console.log(result);
// console.log(new result.Practise);
// console.log("hello world from node js");
// const template_path = path.join(__dirname,"../template/views");
// const partial_path = path.join(__dirname, "../template/partials");
const express = require('express');
const path = require('path');
const app = express();
const fs = require("fs");

//define dynamic port
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//bind the static path to public directory
const static_path = path.join(__dirname,"public");
require('ejs');
app.set("view engine","ejs");
app.use(express.static(static_path));
//app.use("/uploads",express.static("uploads"));

//database part
require('mongoose');
const db =  require('./db/conn.js');

//for accessing schema:
const StudentRegister = require("./db/models/studentregister");
const CounsellorRegister = require("./db/models/counsellorregister");
const AdminSchema = require("./db/models/adminquestion");
const Admins = require("./db/models/admin");
const AddEvent = require("./db/models/addevent");
const UserEvent = require("./db/models/userevent");
const News = require("./db/models/news");
const Comments = require("./db/models/forumcomment");
const Forum = require("./db/models/forum");

//for uploading files and images
var multer = require('multer');
var upload = multer({dest:'uploads/'});
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
     },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});
var upload = multer({ storage: storage })
//let studentname = "";
//let password = "";
//let email = "";
let registernumber="19BCE2648";
let failure = false;
let msg = "";
let StudentloggedIn = false;
let CounsellorloggedIn = false;
let AdminloggedIn=false;

app.get("/",(_req,res)=> {
    res.render("index",{failure:failure,msg:msg});
    failure=false;
    msg="";
});
app.get("/adminregister",(req,res)=>{
    res.render("adminregister" ,{failure:false,msg:""});
    failure=false;
})
app.post("/adminregister",async(req,res)=>{
    console.log("Registering a admin");
    try{
        const registerAdmin = new Admins({
            adminid:req.body.adminid,
            password:req.body.password
        })
        const admin_registered = await registerAdmin.save();
        res.redirect("adminlogin");
        // res.render("adminlogin",{failure:failure,msg:msg});
        // failure=false;
        // msg="";
    }catch(error){
        res.status(400).render("adminregister" ,{failure:true,msg:"Duplicated Information"});
        failure=true;
    }
})
app.get("/adminlogin",(req,res)=>{
    console.log("Request for Admin login received");
    if(AdminloggedIn==true){
        res.redirect("adminindex");
    }else{
        res.render("adminlogin" ,{failure:failure,msg:msg});
        failure=false;
        msg="";
    }
})
app.post("/adminlogin",async(req,res)=>{
    console.log("Admin login request received");
    try{
        const adminexist = await Admins.findOne( {adminid:req.body.adminid});
        console.log(adminexist);
        if(adminexist){
            if(adminexist.password == req.body.password){
                res.status(201).render("adminindex",{failure:false,msg:""});
                AdminloggedIn=true;
            }else{
                res.render("adminlogin",{failure:true,msg:"Passport Invalid"});
            }
        }else{
            res.render("adminlogin",{failure:true,msg:"Account cannot be found"});
        }
    }catch(error){
        res.status(400).render("adminlogin",{failure:true,msg:"Error Occured"});
    }
})
app.get("/adminindex",(req,res)=>{
    console.log("Admin Index being loaded");
    res.render("adminindex",{failure:false,msg:""});
})
app.post("/adminindex",upload.single("file"),async(req,res)=>{
    console.log("Posting an Question");
   console.log(req.file.originalname);
    try{
        const uploadquestion = new AdminSchema({
            question:req.body.question,
            createdBy:req.body.createdBy,
            answer:req.body.answer,
            createdAt:req.body.createdAt,
            img:{
                // data: fs.readFileSync(path.join(__dirname+"/uploads/" +req.file.originalname)),
                data:"http://localhost:3000/file/${req.file.filename}",
                contentType:"image/png"
            }
        })
        //  if(req.file){
        //     uploadquestion.img=req.file.path
    //}
        const question_registered = await uploadquestion.save();
        console.log(question_registered);
        res.status(201).render("index",{failure:true,msg:"Congratulation your question has been posted"});
    }catch(error){
        console.log(error);
        res.status(400).render("adminindex" ,{failure:true,msg:"Question for today has already been posted or error occured"});
    }
})
app.get("/adminforum",(req,res)=>{
    console.log("Admin forum being loaded");
    res.render("adminforum",{failure:false,msg:""});
})
app.post("/adminforum",async(req,res)=>{
    try{
        await Forum.deleteMany({});
        await News.deleteMany({});
        console.log(req.body);
        const createforum = new Forum({
            forumtopic:req.body.forumtopic
        })
        console.log(createforum);
        await createforum.save();
        const createnews = new News({
            news:req.body.news,
            newsurl:req.body.url
        })
        await createnews.save();
        res.status(201).render("adminindex",{failure:true,msg:"Congratulation your information has been posted"});
    }catch(error){
        res.send(error);
    }
})

app.get("/logout",(req,res)=>{
    if(StudentloggedIn==true){
        StudentloggedIn=false;
        
    }else if(CounsellorloggedIn==true){
        CounsellorloggedIn=false;
    }else if(AdminloggedIn==true){
        AdminloggedIn=false;
        StudentloggedIn=false;
        CounsellorloggedIn=false;
    }else{
        AdminloggedIn=false;
        StudentloggedIn=false;
        CounsellorloggedIn=false; 
    }
    res.render("index",{failure:true,msg:"You have been successfully logged out"});
})
app.get("/studentlogin",(req,res)=>{
    console.log("Request for student login received");
    if(StudentloggedIn==true){
        res.render("studentindex",{failure:false,msg:"",registernumber:registernumber});
    }else{
        //StudentloggedIn=true;
        res.render("studentlogin" ,{failure:failure,msg:msg});
        failure=false;
        msg="";
    }
})
app.post("/studentlogin",async(req,res)=>{
    console.log("Checking for the user");
    try{
        const validstudent = await StudentRegister.findOne( {registration_number:req.body.regno});
        if(validstudent){
            if(validstudent.password == req.body.password){
                registernumber=req.body.regno;
                res.status(201).render("studentindex",{failure:false,msg:"",registernumber:registernumber});
                StudentloggedIn=true;
            }else{
                res.render("studentlogin",{failure:true,msg:"Passport Invalid"});
            }
        }else{
            res.render("studentlogin",{failure:true,msg:"Account cannot be found"});
        }
    }catch(error){
        res.status(400).render("studentlogin",{failure:true,msg:"Error Occured"});
    }
})

//taking request from student register
app.get("/studentregister",(req,res)=>{
    console.log("Request for student registration has been received");
    StudentloggedIn=false;
    failure=false;
    msg="";
    res.render("studentregister",{failure:failure,msg:msg});
})

//creating a new user in the database
app.post("/studentregister",async(req,res)=>{
    console.log("Registering a user");
    //registernumber=req.body.regno;
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
        res.status(201).render("studentlogin",{failure:failure,msg:msg});
        failure=false;
        msg="";
    }catch(error){
        res.status(400).render("studentregister" ,{failure:true,msg:"Duplicated Information"});
    }
})


app.get("/studentindex",(req,res)=>{
    //let results = {"title":"hello","description":"gekk"};
    console.log("User's Home");
    console.log(registernumber);
    if(StudentloggedIn==true){
        res.render("studentindex",{failure:failure,msg:msg,registernumber:registernumber});
        failure=false;
        msg = "";
    }else{
        res.render("index",{failure:false,msg:""});
    }
})

app.get("/counsellorlogin",(req,res)=>{
    if(CounsellorloggedIn==true){
        res.render("counsellorindex");
    }else{
        CounsellorloggedIn=false;
        failure=false;
        msg="";
        res.render("counsellorlogin",{failure:failure,msg:msg});
    }
})
app.post("/counsellorlogin",async(req,res)=>{
    console.log("Checking for the user");
    const mailid = req.body.email;
    const passwd = req.body.password;
    try{
        const validcounsellor = await CounsellorRegister.findOne( {email:mailid});
        if(validcounsellor){
            if(validcounsellor.password == passwd){
                res.status(201).render("counsellorindex",{failure:false,msg:""});
                AdminloggedIn=true;
            }else{
                res.render("counsellorlogin",{failure:true,msg:"Passport Invalid"});
            }
        }else{
            res.render("counsellorlogin",{failure:true,msg:"Account cannot be found"});
        }
    }catch(error){
        res.status(400).render("counsellorlogin",{failure:true,msg:"Error Occured"});
    }
})

app.get("/counsellorregistration",(req,res)=>{
    console.log("Request for counsellor registration has been received");
    CounsellorloggedIn=false;
    failure=false;
    msg="";
    res.render("counsellorregistration",{failure:failure,msg:msg});
})
//creating a new counsellor in the database
app.post("/counsellorregistration",async(req,res)=>{
    try{
        const registerCounsellor = new CounsellorRegister({
            firstname:req.body.fname,
            midddlename:req.body.mname,
            lastname:req.body.lname,
            age:req.body.age,
            summmary:req.body.summmary,
            email:req.body.email,
            password:req.body.password,
            phone_number:req.body.phno
        })
        const couns_registered = await registerCounsellor.save();
        res.status(201).render("counsellorlogin",{failure:false,msg:""});
    }catch(error){
        res.status(400).send(error);
    }
})

app.get("/events",async (req,res)=>{
    console.log("Events page being loaded");
    try{
       const this_events = await UserEvent.findOne({
        regno:registernumber
        }).populate("events");
        res.render("events",{failure:false,msg:"",registernumber:registernumber,eventfound:this_events.events});
    }
    catch(error){
        res.send(error);
    }
})
    
app.get("/addevent",(req,res)=>{
   console.log("Event adding page");
   res.render("addevent",{failure:false,msg:"",registernumber:registernumber});
})

app.post("/addevent",async(req,res)=>{
    console.log("Events is being added");
    try{
        //let userevent;
        const addevent = new AddEvent({
            eventname:req.body.eventname,
            eventdesc:req.body.eventdesc,
            eventlocation:req.body.eventlocation,
            eventdate:req.body.eventdate,
            reminderemail:req.body.reminderemail
        })
        console.log(addevent);
        const adding_event  = await addevent.save();
        console.log(adding_event);
        let userevent = await UserEvent.exists({regno:req.body.regno});
        console.log(userevent);
        if(userevent==null){
            userevent = new UserEvent({
                regno:req.body.regno
            })
            await userevent.save();
        }
        console.log(userevent);
        
        const update_user_event = await UserEvent.updateMany(
            {_id:userevent._id},
            { $push: { events: addevent._id } },
            //{ new: true, useFindAndModify: false }
        );
        console.log(update_user_event);
        const linking_event = await UserEvent.findById(userevent._id).populate("events");//.exec((err,events)=>{
            //console.log("populated events" + events);
        //});
        console.log(linking_event.populated('events'));
        console.log(linking_event.events[0].eventname);
        res.status(201).render("events",{failure:true,msg:"Event has been added",registernumber:registernumber,eventfound:this_events.events});
    }catch(error){
        res.status(400).send(error);
    }
})

//for chatting with friend
app.get("/chat",async(req,res)=>{
    try{
        let friends = await StudentRegister.find({});
        console.log(friends[0].firstname);
        let openforum = await
        res.render("chat",{failure:false,msg:"",registernumber:registernumber,friends:friends});
    }catch(error){
        res.send(error);
    }
})
app.listen(port,()=>{
    console.log(`Listening at port ${port} `);
})

//comment vaneko addevent ho AddEvent
//Tutorial vaneko UserEvent h
