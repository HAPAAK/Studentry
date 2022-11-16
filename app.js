if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require('express');
const path = require('path');
const app = express();
//onst fs = require("fs");
const bcrypt = require("bcrypt");
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");

var session;
app.use(sessions({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:1000*60*60*24},
    store:MongoStore.create({mongoUrl:'mongodb+srv://resham:sapkota@cluster0.pjitpto.mongodb.net/?retryWrites=true&w=majority',ttl:2*60*60})
}))
app.use(cookieParser());
//app.use(express.json());
// //define dynamic port
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//bind the static path to public directory
const static_path = path.join(__dirname,"public");
app.set("view engine","ejs");
app.use(express.static(static_path));
app.use("/uploads",express.static("uploads"));

//database part
require('mongoose');
const db =  require('./db/conn.js');

//mail part
const cron = require("./mail");
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
const CounsellorRel = require("./db/models/counsellorrel");
const CounsellorMsg = require("./db/models/counsellormsg");
const Appointment = require("./db/models/appointment");
const Allremainder = require("./db/models/reminders");

//for uploading files and images
var multer = require('multer');
const { Admin } = require("mongodb");
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
     },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});
var upload = multer({ storage: storage })


let failure = false;
let msg = "";
let StudentloggedIn = false;
let CounsellorloggedIn = false;
let AdminloggedIn=false;

app.get("/",(_req,res)=> {
    //console.log(req.session);
    res.render("index",{failure:failure,msg:msg});
    failure=false;
    msg="";
});
app.get("/adminregister",(req,res)=>{
    res.render("adminregister" ,{failure:failure,msg:msg});
    failure=false;
    msg="";
})
app.post("/adminregister",async(req,res)=>{
    console.log("Registering a admin");
    //const hashedpassword = await bcrypt.hash(req.body.password,10);
    try{
        const registerAdmin = new Admins({
            email:req.body.email,
            password:req.body.password
        })
        const admin_registered = await registerAdmin.save();
        res.redirect("/adminlogin");
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/adminregister");
    }
})
app.get("/adminlogin",(req,res)=>{
    console.log("Request for Admin login received");
    if(AdminloggedIn==true){
        failure=false;
        msg="";
        res.redirect("/adminindex");
    }else{
        res.render("adminlogin" ,{failure:failure,msg:msg});
        failure=false;
        msg="";
    }
})
app.post("/adminlogin",async(req,res)=>{
    console.log("Admin login request received");
    try{
        const adminexist = await Admins.findOne( {email:req.body.email});
        console.log(adminexist);
        if(adminexist){
            if(adminexist.password == req.body.password){
                AdminloggedIn=true;
                failure=false;
                msg="";
                res.redirect("/adminindex");                
            }else{
                failure=true;
                msg="Passport Invalid";
                res.redirect("/adminlogin");
            }
        }else{
            failure=true;
            msg="Accont could not be found";
            res.redirect("/adminlogin");
        }
    }catch(error){
        failure=true;
        msg="Error occured";
        res.redirect("/adminlogin");
    }
})

app.get("/adminindex",(req,res)=>{
    console.log("Admin Index being loaded");
    res.render("adminindex",{failure:failure,msg:msg});
    failure=false;
    msg="";
})
app.post("/adminindex",upload.single("file"),async(req,res)=>{
    console.log("Posting an Question");
    //please ammend this
    await AdminSchema.deleteMany({});
   console.log(req.file.originalname);
    try{
        let imageurl = `/uploads/${req.file.filename}`;
        const uploadquestion = new AdminSchema({
            question:req.body.question,
            createdBy:req.body.createdBy,
            answer:req.body.answer,
            createdAt:req.body.createdAt,
            img:imageurl
            // img:{
            //     // data: fs.readFileSync(path.join(__dirname+"/uploads/" +req.file.originalname)),
            //     data:"http://localhost:3000/file/${req.file.filename}",
            //     contentType:"image/png"
            // }
        })
        console.log(uploadquestion);
        const question_registered = await uploadquestion.save();
        failure=true;
        msg="Congratulation your question has been posted";
        res.redirect("/adminindex");
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/adminindex");
    }
})
app.get("/adminforum", (req,res)=>{
    console.log("Admin forum being loaded");
    res.render("adminforum",{failure:failure,msg:msg});
    failure= false;
    msg="";
})
app.post("/adminforum", async(req,res)=>{
    try{
        
        // await News.deleteMany({});
        console.log(req.body);
        if(req.body.forumtopic.length !== 0){
            await Forum.deleteMany({});
            const createforum = new Forum({
            forumtopic:req.body.forumtopic
            });
            console.log(createforum);
            await createforum.save();
        }
        if(req.body.news.length !==0){
            const createnews = new News({
                news:req.body.news,
                newsurl:req.body.url
            });
            await createnews.save();
        }
        failure=true;
        msg="Congratulation your information has been posted";
        res.redirect("/adminindex");
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/adminforum");
    }
})

app.get("/logout",(req,res)=>{
    req.session.destroy();
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
    failure=true;
    msg="You have been successfully logged out";
    res.redirect("/");
})

app.get("/counsellorlogin",(req,res)=>{
    if(CounsellorloggedIn==true){
        res.render("counsellorindex",{failure:failure,msg:msg});
        failure=false;
        msg="";
    }else{
        res.render("counsellorlogin",{failure:failure,msg:msg});
        failure=false;
        msg="";
    }
})
app.post("/counsellorlogin",async(req,res)=>{
    
    console.log("Checking for the user");
    const mailid = req.body.email;
    const passwd = req.body.password;
    try{
        const validcounsellor = await CounsellorRegister.findOne( {email:mailid});
        console.log(validcounsellor);
        if(validcounsellor){
            if(validcounsellor.password == passwd){
                CounsellorloggedIn=true;
                failure=false;
                msg="";
                session = req.session;
                session.counselloremail = mailid;
                console.log(req.session);
                res.redirect("/counsellorindex");
                
            }else{
                failure=true;
                msg="Passport Invalid";
                res.redirect("/counsellorlogin");
            }
        }else{
            failure=true;
            msg="Account cannot be found";
            res.redirect("/counsellorlogin");
        }
    }catch(error){
        failure=true;
        msg="Error occured";
        res.redirect("/counsellorlogin");
    }
})

app.get("/counsellorregistration",(req,res)=>{
    console.log("Request for counsellor registration has been received");
    res.render("counsellorregistration",{failure:failure,msg:msg});
    failure=false;
    msg="";
})
//creating a new counsellor in the database
app.post("/counsellorregistration",upload.single("file"), async(req,res)=>{
    try{
        let imageurl = `/uploads/${req.file.filename}`;
        const registerCounsellor = new CounsellorRegister({
            firstname:req.body.fname,
            midddlename:req.body.mname,
            lastname:req.body.lname,
            age:req.body.age,
            summary:req.body.summary,
            email:req.body.email,
            password:req.body.password,
            phone_number:req.body.phno,
            designation:req.body.designation,
            gender:req.body.gender,
            img:imageurl
        })
        const couns_registered = await registerCounsellor.save();
        failure=false;
        msg="";
        res.redirect("/counsellorlogin");
        
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/counsellorlogin");
    }
})
//mind counsellormail is mongofield while counselloremail is a variable
app.get("/counsellorindex",async(req,res)=>{
    try{
        const counselloremail= req.session.counselloremail;
        const allappoint  = await Appointment.find({createdBy:counselloremail});
        const allcounselee = await CounsellorRegister.findOne({email:counselloremail}).populate("students");
        const allcounseleechat = await CounsellorRel.find({counsellormail:counselloremail});
        let counseleephoto = [];
        for(let i=0;i<allcounseleechat.length;i++){
            //console.log(await allcounseleechat[i].regno);
            let temp = await StudentRegister.findOne({registration_number:allcounseleechat[i].regno});
            //console.log(temp);
            let imageurl = temp.img;
            counseleephoto.push(imageurl);
        }
        res.render("counsellorindex",{failure:failure,msg:msg,allappoint:allappoint,allcounselee:allcounselee.students,allcounseleechat:allcounseleechat,counseleephoto:counseleephoto,counselloremail:counselloremail});
        failure=false;
        msg="";
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/counsellorindex");
    }
})

app.get("/counsellorchat", async(req,res)=>{
    try{
        console.log(req.query);
        const counselloremail= req.session.counselloremail;
        const temp_counseleechatdetails = await CounsellorRel.findOne({_id:req.query.id});
        const counseleechatdetails = await temp_counseleechatdetails.populate("messages");
        const sprofile = await StudentRegister.findOne({registration_number:counseleechatdetails.regno});
        res.render("counsellorchat",{failure:failure,msg:msg,counselloremail:counselloremail,counseleechatdetails:counseleechatdetails.messages,sprofile:sprofile,query:req.query});
        failure=false;
        msg="";
    }catch(error){
        res.send(error);
    }
})
app.post("/counsellorchat",async(req,res)=>{
    try{
        const studentid = req.body.counseleeid;
        const counselloremail= req.session.counselloremail;
        //console.log(studentid);
        const counsellorrelation = await CounsellorRel.findOne({_id:studentid});
        const newcounselmsg = new CounsellorMsg({
            createdAt:Date.now(),
            context:req.body.forumcomm,
            from:"counsellor",
            By:counselloremail
        })
        await newcounselmsg.save();
        //console.log(newcounselmsg);
        //console.log(counsellorrelation);
        const studentrel = await CounsellorRel.updateOne(
            {_id:studentid},
            {$push:{messages:newcounselmsg._id}},{$set:{lastmodified:Date.now()}}
        )
        //console.log(studentrel);
        res.redirect("/counsellorchat?id="+studentid);
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/counsellorchat?id="+studentid);
    }
})
app.get("/counsellorprofile",async(req,res)=>{
    try{
        const counselloremail= req.session.counselloremail;
        let counsellor = await CounsellorRegister.findOne({email:counselloremail});
        //console.log(counsellor);
        res.render("counsellorprofile",{failure:failure,msg:msg,counselloremail:counselloremail,counsellor:counsellor});
        failure=false;
        msg="";
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/counsellorprofile");
    }
})
app.post("/counsellorprofile",upload.single("imageurl"), async(req,res)=>{
    try{
        const counselloremail= req.session.counselloremail;
        let cprofile = await CounsellorRegister.findOne({email:counselloremail});
        console.log(req.body);
        let imgurl = `/uploads/${req.file.filename}`;
        await CounsellorRegister.findByIdAndUpdate(
            {_id:cprofile.id},
            {$set: {
                firstname:req.body.fname,
                lastname:req.body.lname,
                age:req.body.age,
                designation:req.body.designation,
                gender:req.body.gender,
                email:req.body.email,
                summary:req.body.summary,
                phone_number:req.body.phno,
                img:imgurl
            }}
        );
        failure=true;
        msg="Your details have been updated";
        res.redirect("/counsellorprofile");
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/counsellorprofile");
    }
})
app.get("/bookappointment",(req,res)=>{
    res.render("bookappointment",{failure:failure,msg:msg});
    failure=false;
    msg="";
})

app.post("/bookappointment",async(req,res)=>{
    try{
        const counselloremail= req.session.counselloremail;
        //console.log(d.setDate(d.getDate()-1));
       const appointdetails = new Appointment({
            createdBy:counselloremail,
            date:req.body.appoint_date,
            venue_type:req.body.appoint_type,
            venue:req.body.appoint_venue,
            beneficiary:req.body.beneficiary,
            instruction:req.body.appoint_ins,
       })
       await appointdetails.save();
       const d = new Date(req.body.appoint_date);
       //reminderdate is string telling when to schedule
       var reminderdate = req.body.reminderdate;
       if (reminderdate === "1hour"){
        d.setTime(d.getTime()-60*60*1000);
       }else if(reminderdate === "3hour"){
        d.setTime(d.getTime()-3*60*60*1000);
       }else{
        d.setDate(d.getDate()-1);
       }
       console.log(d);
       const counselee = StudentRegister.findOne({registration_number:req.body.beneficiary});
        const remainder = new Allremainder({
            createdAt:Date.now(),
            reminderdate:d,
            remindertype:"Appointment",
            createdBy:counselloremail,
            beneficiaryemail:counselee.email,
            appointment:appointdetails._id
        })
        await remainder.save();
        console.log(remainder);
       failure=true;
       msg="Appointment has been created";
       res.redirect("/counsellorindex");
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/bookappointment");
    }
})

//student part
app.get("/studentlogin",async(req,res)=>{
    try{
        console.log("Request for student login received");
        session = req.session;
        console.log(session);
        if(session.studentid){
            res.redirect("/studentindex");
        }else{
            res.render("studentlogin" ,{failure:failure,msg:msg});
            failure=false;
            msg="";
        }  
    }catch(error){
        res.send(error);
    }
})
app.post("/studentlogin",async(req,res)=>{
    console.log("Checking for the user");
    try{
        const validstudent = await StudentRegister.findOne( {registration_number:req.body.regno});
        if(validstudent){
            if(validstudent.password === req.body.password){
                registernumber=req.body.regno; 
                StudentloggedIn=true;
                failure=false;
                msg="";
                session=req.session;
                session.studentid = req.body.regno;
                console.log(req.session);
                res.redirect("/studentindex");
            }else{
                failure=true;
                msg="Passport Invalid";
                res.redirect("/studentlogin");
            }
        }else{
            failure=true;
            msg="Account cannot be found";
            res.redirect("/studentlogin");
        }
    }catch(error){
        failure=true;
        msg="Error occured";
        res.redirect("/studentlogin");
    }
})

//taking request from student register
app.get("/studentregister",(req,res)=>{
    console.log("Request for student registration has been received");
    StudentloggedIn=false;
    res.render("studentregister",{failure:failure,msg:msg}); 
    failure=false;
    msg="";
})

//creating a new user in the database
app.post("/studentregister",upload.single("file"),async(req,res)=>{
    console.log("Registering a user");
    //registernumber=req.body.regno;
    try{
        // const hashedpassword = bcrypt.hash(rq.body.password,10);
        let imageurl = `/uploads/${req.file.filename}`;
        const registerStudent = new StudentRegister({
            firstname:req.body.fname,
            midddlename:req.body.mname,
            lastname:req.body.lname,
            age:req.body.age,
            registration_number:req.body.regno, 
            email:req.body.email,
            password:req.body.password,
            phone_number:req.body.phno,
            gender:req.body.gender,
            img:imageurl
        })
        const stu_registered = await registerStudent.save();
        res.redirect("/studentlogin");
    }catch(error){
        failure=true;
        msg="Duplicated Information";
        res.redirect("/studentregister");
    }

})


app.get("/studentindex",async(req,res)=>{
    //let results = {"title":"hello","description":"gekk"};
    try{
        session = req.session;
        const registernumber = session.studentid;
        console.log("User's Home");
        console.log(registernumber);
        const newsinfo = await News.find({});
        const todaygame = await AdminSchema.findOne({});
        res.render("studentindex",{failure:failure,msg:msg,registernumber:req.session.studentid,newsinfo:newsinfo,todaygame:todaygame});
        failure=false;
        msg = "";  
    }catch(error){
        res.send(error);
    }
})

app.post("/studentindex",async(req,res)=>{
    try{
        console.log("User's Home");
        const newsinfo = await News.findOne({});
        const todaygame = await AdminSchema.findOne({});
        console.log(req.body.answer);
        if(req.body.answer == todaygame.answer){
            failure=true;
            msg="Your answer is correct";
        }else{
            failure=true;
            msg = "Sorry correct answer is: "+ todaygame.answer;     
        }
        res.redirect("/studentindex");
    }catch(error){
        res.send(error);
    }
})

app.get("/events",async (req,res)=>{
    console.log("Events page being loaded");
    try{
        //console.log(req.session)
        const registernumber = req.session.studentid;
       const userkoevent = await UserEvent.findOne({regno:registernumber});
       let eventfound=[]; 
       if(userkoevent!=null){
            let temp = await userkoevent.populate("events");
            eventfound = temp.events;
        }
        //console.log(eventfound);
        res.render("events",{failure:failure,msg:msg,registernumber:registernumber,eventfound:eventfound});
        failure=false;
        msg="";
    }
    catch(error){
        res.send(error);
    }
})
    
app.get("/addevent",(req,res)=>{
   console.log("Event adding page");
   res.render("addevent",{failure:failure,msg:msg,registernumber:req.session.studentid});
   failure=false;
   msg="";

})

app.post("/addevent",async(req,res)=>{
    console.log("Events is being added");
    try{
        //let userevent;
        console.log(req.body);
        const d = new Date(req.body.eventdate);
        //reminderdate is string telling when to schedule
        var reminderdate = req.body.reminderdate;
        if (reminderdate == "1hour"){
         d.setTime(d.getTime()-60*60*1000);
        }else if(reminderdate == "3hour"){
         d.setTime(d.getTime()-3*60*60*1000);
        }else{
         d.setDate(d.getDate()-1);
        }
        console.log(d);
        const addevent = new AddEvent({
            eventname:req.body.eventname,
            eventtype:req.body.eventtype,
            eventdesc:req.body.eventdesc,
            eventlocation:req.body.eventlocation,
            eventdate:req.body.eventdate,
            reminderemail:req.body.reminderemail,
            eventtype:req.body.eventtype,
            reminderdate:d
        })
        await addevent.save();
        console.log(addevent);
        var eventtype = req.body.eventtype;
        console.log(eventtype);
        if(eventtype == "Event"){
            console.log("khate");
            const remainder = new Allremainder({
                createdAt:Date.now(),
                reminderdate:d,
                remindertype:eventtype,
                createdBy:req.body.regno,
                beneficiaryemail:req.body.reminderemail,
                events:addevent._id
            })
            await remainder.save();
            console.log(remainder);
        }
        let userevent = await UserEvent.exists({regno:req.body.regno});
        console.log(userevent);
        if(userevent==null){
            userevent = new UserEvent({
                regno:req.body.regno
            })
            await userevent.save();
        }
        const update_user_event = await UserEvent.updateOne(
            {_id:userevent._id},
            { $push: { events: addevent._id } }
        )
        failure=true;
        msg="Events has been added";
        res.redirect("/events");
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/addevent");
    }
})
app.get("/deleteevent",async(req,res)=>{
    try{
        const registernumber = req.session.studentid;
        console.log(req.query);
        const deleteevent = await AddEvent.deleteOne({_id:req.query.eventid});
        //0console.log(deleteevent);
        let userevent = await UserEvent.findOne({regno:registernumber});
        await Allremainder.deleteOne({_id:req.query.eventid});
        await UserEvent.updateOne({_id:userevent._id},{$pull: {events:req.query.eventid}},function(err,docs){
            if(err){
                failure=true;
                msg=err;
                return res.redirect("/events");
            }
            return res.redirect("/events");
        });
    }catch(error){
        //res.send(error);
    }
})
//for chatting with friend
app.get("/chat",async(req,res)=>{
    try{
        let friends = await StudentRegister.find({});
        let openforum = await Forum.find({});
        const forumcomment = await Forum.findOne({}).populate("comments");
        console.log(forumcomment.comments.length);
        res.render("chat",{failure:failure,msg:msg,
        registernumber:req.session.studentid,
        friends:friends,
        openforum:openforum,
        forumcomment:forumcomment.comments
        });
        failure=false;
        msg="";
    }catch(error){
        res.send(error);
    }
})
app.post("/chat",async(req,res)=>{
    try{
        let friends = await StudentRegister.find({});
        const addingcommentforum = new Comments({
            regno:req.session.studentid,
            content:req.body.forumcomm
        })
        const added_comment_forum = await addingcommentforum.save();
        const forum_data = await Forum.find({});
        const update_forum_data = await Forum.updateOne(
            {_id:forum_data[0]._id},
            { $push: {comments : addingcommentforum._id}}
        );
        failure=true;
        msg="Comment has been added";
        res.redirect("/chat");
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/chat");
    }
})

app.get("/usercounselling",async(req,res)=>{
    console.log("User counselling page");
    try{
        const user = await StudentRegister.findOne({registration_number:req.session.studentid});
        if(user.hascounsellor==false){
            const counsellor = await CounsellorRegister.findOne({});
            //console.log(counsellor);
            let val = true;
            console.log(user);
            await StudentRegister.updateOne(
                {_id:user._id},
                {$set:{counsellorinfo:counsellor.email,
                hascounsellor:val}}
            )
            //console.log(user);
            await CounsellorRegister.updateOne(
                {_id:counsellor._id},
                { $push: { students: user._id } }
            )
        }
        //console.log(user);
        const counsell = await CounsellorRegister.findOne({email:user.counsellorinfo});
        const msgwithcounsellor = await CounsellorRel.findOne({regno:user.registration_number}).populate("messages");
        console.log(msgwithcounsellor);
        let messagewithcounsellor=[];
        if(msgwithcounsellor==null){
            messagewithcounsellor=[];
        }else{
            messagewithcounsellor=msgwithcounsellor.messages;
        }
        const appointment = await Appointment.find({beneficiary:user.registration_number});
        //console.log(messagewithcounsellor.length);
        res.render("usercounselling",{failure:failure,msg:msg,registernumber:req.session.studentid,counsel:counsell,msgwithcounsel:messagewithcounsellor,appointment:appointment});
        failure=false;
        msg="";
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/usercounselling");
    }
})
app.post("/usercounselling",async(req,res)=>{
    try{
        let fr="student";
        const registernumber = req.session.studentid;
        const user = await StudentRegister.findOne({registration_number:registernumber});
        const counsellormsg = new CounsellorMsg({
            createdAt:Date.now().toString(),
            By:registernumber,
            from:fr,
            context:req.body.forumcomm
        })
        await counsellormsg.save();
        let studentrelcounsel = await CounsellorRel.exists({regno:registernumber});
        if(studentrelcounsel==null){
            studentrelcounsel = new CounsellorRel({
                regno:registernumber,
                counsellormail:user.counsellorinfo
            })
            await studentrelcounsel.save();
        }
        const studentrel = await CounsellorRel.updateOne(
            {_id:studentrelcounsel._id},
            {$push:{messages:counsellormsg._id}},{$set:{lastmodified:Date.now()}}
        )
        res.redirect("/usercounselling");
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/usercounselling");
    }
})

app.get("/studentprofile",async(req,res)=>{
    try{ 
        const registernumber = req.session.studentid;
        console.log(req.session);   
        let student = await StudentRegister.findOne({registration_number:registernumber});
        res.render("studentprofile",{failure:failure,msg:msg,registernumber:registernumber,student:student});
        failure=false;
        msg="";
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/studentprofile");
    }

})
app.post("/studentprofile",upload.single("imageurl"), async(req,res)=>{
    try{
        console.log("Updating student profile");
        console.log(req.session);
        const registernumber = req.session.studentid;
        let student = await StudentRegister.findOne({registration_number:registernumber});
        let imgurl = `/uploads/${req.file.filename}`;
        console.log(student);
        let updatestudentdetails = await StudentRegister.findByIdAndUpdate(
            {_id:student._id},
            {$set:{  
                firstname: req.body.fname,
                lastname:req.body.lname,
                age:req.body.age,
                gender:req.body.gender,
                phone_number:req.body.phno,
                img:imgurl
            }}
        );
        //console.log(updatestudentdetails);
        failure=true;
        msg="Your details has been updated";
        res.redirect("/studentprofile");
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/studentprofile");
    }
})

app.listen(port,()=>{
    console.log(`Listening at port ${port} `);
})
