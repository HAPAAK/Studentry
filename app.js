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
app.set("view engine","ejs");
app.use(express.static(static_path));
app.use("/uploads",express.static("uploads"));

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
const CounsellorRel = require("./db/models/counsellorrel");
const CounsellorMsg = require("./db/models/counsellormsg");
const Appointment = require("./db/models/appointment");


//for uploading files and images
var multer = require('multer');
//var upload = multer({dest:'uploads/'});
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
     },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});
var upload = multer({ storage: storage })


let registernumber="19BCE2658";
let counselloremail="rhen.targ42@gmail.com";
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
    res.render("adminregister" ,{failure:failure,msg:msg});
    failure=false;
    msg="";
})
app.post("/adminregister",async(req,res)=>{
    console.log("Registering a admin");
    try{
        const registerAdmin = new Admins({
            adminid:req.body.adminid,
            password:req.body.password
        })
        const admin_registered = await registerAdmin.save();
        res.redirect("/adminlogin");
    }catch(error){
        failure=true;
        msg="Duplicated information";
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
        const adminexist = await Admins.findOne( {adminid:req.body.adminid});
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
        //  if(req.file){
        //     uploadquestion.img=req.file.path
    //}
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
app.get("/adminforum",(req,res)=>{
    console.log("Admin forum being loaded");
    res.render("adminforum",{failure:failure,msg:msg});
    failure= false;
    msg="";
})
app.post("/adminforum",async(req,res)=>{
    try{
        let imageurl = `/uploads/${req.file.filename}`;
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
        const allappoint  = await Appointment.find({createdBy:counselloremail});
        const allcounselee = await CounsellorRegister.findOne({email:counselloremail}).populate("students");
        const allcounseleechat = await CounsellorRel.find({counsellormail:counselloremail});
        let counseleephoto = [];
        for(let i=0;i<allcounseleechat.length;i++){
            console.log(await allcounseleechat[i].regno);
            let temp = await StudentRegister.findOne({registration_number:allcounseleechat[i].regno});
            //console.log(temp);
            let imageurl = temp.img;
            counseleephoto.push(imageurl);
        }
        //console.log(counseleephoto);
        //console.log(allcounseleechat);
        //console.log(await allcounseleechat[0].populate("messages"));
        res.render("counsellorindex",{failure:failure,msg:msg,allappoint:allappoint,allcounselee:allcounselee.students,allcounseleechat:allcounseleechat,counseleephoto:counseleephoto});
        failure=false;
        msg="";
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/counsellorindex");
    }
})
// app.post("/counsellorindex",async(req,res)=>{
//     try{
//         let counseleeid = req.body.counseleechatid;
//         const counselee = await CounsellorRel.findOne({_id:counseleeid});
//         const counseleedetails = await StudentRegister.findOne({registration_number:counselee.regno});
//         const counseleechatdetails = await counselee.populate("messages");

//     }catch(error){
//         failure=true;
//         msg=error;
//         res.redirect("/counsellorindex");
//     }
// })
app.get("/counsellorchat", async(req,res)=>{
    try{
        console.log(req.query);
        const temp_counseleechatdetails = await CounsellorRel.findOne({_id:req.query.id});
        const counseleechatdetails = await temp_counseleechatdetails.populate("messages");
        const sprofile = await StudentRegister.findOne({registration_number:counseleechatdetails.regno});
        res.render("counsellorchat",{failure:failure,msg:msg,counseleechatdetails:counseleechatdetails.messages,sprofile:sprofile,query:req.query});
        failure=false;
        msg="";
    }catch(error){
        res.send(error);
    }
})
app.post("/counsellorchat",async(req,res)=>{
    try{
        const studentid = req.body.counseleeid;
        console.log(studentid);
        const counsellorrelation = await CounsellorRel.findOne({_id:studentid});
        const newcounselmsg = new CounsellorMsg({
            createdAt:Date.now(),
            context:req.body.forumcomm,
            from:"counsellor",
            By:counselloremail
        })
        await newcounselmsg.save();
        console.log(newcounselmsg);
        console.log(counsellorrelation);
        const studentrel = await CounsellorRel.updateMany(
            {_id:studentid},
            {$push:{messages:newcounselmsg._id}},{$set:{lastmodified:Date.now()}}
        )
        console.log(studentrel);
        res.redirect("/counsellorchat?id="+studentid);
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/counsellorchat?id="+studentid);
    }
})
app.get("/bookappointment",(req,res)=>{
    res.render("bookappointment",{failure:failure,msg:msg});
    failure=false;
    msg="";
})

app.post("/bookappointment",async(req,res)=>{
    try{
       const appointdetails = new Appointment({
            createdBy:counselloremail,
            date:req.body.appoint_date,
            time:req.body.appoint_time,
            venue_type:req.body.appoint_type,
            venue:req.body.appoint_venue,
            beneficiary:req.body.beneficiary,
            instruction:req.body.appoint_ins,
            emailnotify:req.body.emailnotify
       })
       await appointdetails.save();
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
        if(StudentloggedIn==true){
            res.redirect("/studentindex");
            //res.render("studentindex",{failure:false,msg:"",registernumber:registernumber});
        }else{
            //StudentloggedIn=true;
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
            if(validstudent.password == req.body.password){
                registernumber=req.body.regno; 
                StudentloggedIn=true;
                // const newsinfo = await News.findOne({});
                // const todaygame = await AdminSchema.findOne({});
                res.redirect("/studentindex");
                //res.status(201).render("studentindex",{failure:false,msg:"",registernumber:registernumber,newsinfo:newsinfo,todaygame:todaygame});
            }else{
                failure=true;
                msg="Passport Invalid";
                res.redirect("/studentlogin");
                //res.render("studentlogin",{failure:true,msg:"Passport Invalid"});
            }
        }else{
            failure=true;
            msg="Account cannot be found";
            res.redirect("/studentlogin");
            //res.render("studentlogin",{failure:true,msg:"Account cannot be found"});
        }
    }catch(error){
        failure=true;
        msg="Error occured";
        res.redirect("/studentlogin");
        //res.status(400).render("studentlogin",{failure:true,msg:"Error Occured"});
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
        // res.status(201).render("studentlogin",{failure:failure,msg:msg});
        // failure=false;
        // msg="";
    }catch(error){
        failure=true;
        msg="Duplicated Information";
        res.redirect("/studentregister");
        //res.status(400).render("studentregister" ,{failure:true,msg:"Duplicated Information"});
    }

})


app.get("/studentindex",async(req,res)=>{
    //let results = {"title":"hello","description":"gekk"};
    try{
        console.log("User's Home");
        console.log(registernumber);
        const newsinfo = await News.findOne({});
        const todaygame = await AdminSchema.findOne({});
        res.render("studentindex",{failure:failure,msg:msg,registernumber:registernumber,newsinfo:newsinfo,todaygame:todaygame});
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
        //res.render("studentindex",{failure:failure,msg:msg,registernumber:registernumber,newsinfo:newsinfo,todaygame:todaygame});
        
        
    }catch(error){
        res.send(error);
    }
})

app.get("/events",async (req,res)=>{
    console.log("Events page being loaded");
    try{
       const userkoevent = await UserEvent.findOne({regno:registernumber});
       let eventfound=[]; 
       if(userkoevent!=null){
            let temp = await userkoevent.populate("events");
            eventfound = temp.events;
        }
        console.log(eventfound);
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
        // console.log(addevent);
        await addevent.save();
        // console.log(adding_event);
        let userevent = await UserEvent.exists({regno:req.body.regno});
        console.log(userevent);
        if(userevent==null){
            userevent = new UserEvent({
                regno:req.body.regno
            })
            await userevent.save();
        }
        const update_user_event = await UserEvent.updateMany(
            {_id:userevent._id},
            { $push: { events: addevent._id } }
            //{ new: true, useFindAndModify: false }
        )
        // const linking_event = await UserEvent.findById(userevent._id).populate("events");//.exec((err,events)=>{
        //     //console.log("populated events" + events);
        // //});
        // console.log(linking_event.populated('events'));
        // console.log(linking_event.events[0].eventname);
        failure=true;
        msg="Events has been added";
        res.redirect("/events");
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/addevent");
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
        registernumber:registernumber,
        friends:friends,
        openforum:openforum,forumcomment:forumcomment.comments});
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
            regno:registernumber,
            content:req.body.forumcomm
        })
        const added_comment_forum = await addingcommentforum.save();
        const forum_data = await Forum.find({});
        const update_forum_data = await Forum.updateMany(
            {_id:forum_data[0]._id},
            { $push: {comments : addingcommentforum._id}}
        );
        failure=true;
        msg="Comment has been added";
        res.redirect("/chat");
        // const populateforum = await Forum.findOne({}).populate("comments");
        // res.status(201).render("chat",{failure:true,msg:"Comment has been added",
        // registernumber:registernumber,
        // openforum:forum_data,
        // friends:friends,
        // forumcomment:populateforum.comments});
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/chat");
    }
})

app.get("/usercounselling",async(req,res)=>{
    console.log("User counselling page");
    try{
        const user = await StudentRegister.findOne({registration_number:registernumber});
        if(user.hascounsellor==false){
            const counsellor = await CounsellorRegister.findOne({});
            console.log(counsellor);
            let val = true;
            console.log(user);
            await StudentRegister.updateMany(
                {_id:user._id},
                {$set:{counsellorinfo:counsellor.email,
                hascounsellor:val}}
            )
            console.log(user);
            await CounsellorRegister.updateMany(
                {_id:counsellor._id},
                { $push: { students: user._id } }
            )
        }
        console.log(user);
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
        console.log(messagewithcounsellor.length);
        res.render("usercounselling",{failure:failure,msg:msg,registernumber:registernumber,counsel:counsell,msgwithcounsel:messagewithcounsellor,appointment:appointment});
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
        const studentrel = await CounsellorRel.updateMany(
            {_id:studentrelcounsel._id},
            {$push:{messages:counsellormsg._id}},{$set:{lastmodified:Date.now()}}
        )
        //console.log(studentrel);
        // const messagewithcounsellor = await CounsellorRel.findById(studentrelcounsel._id).populate("messages");
        // // console.log(messagewithcounsellor);
        
        // const counsell = await CounsellorRegister.findOne({email:user.counsellorinfo});
       
        // console.log(counsell);
        // const appointment = await Appointment.find({beneficiary:user.registration_number});
        res.redirect("/usercounselling");
        //res.render("usercounselling",{failure:false,msg:"",registernumber:registernumber,counsel:counsell,msgwithcounsel:messagewithcounsellor.messages,appointment:appointment});
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/usercounselling");
    }
})

app.get("/studentprofile",async(req,res)=>{
    try{    
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
app.post("/studentprofile",async(req,res)=>{
    try{
        let student = await StudentRegister.findOne({registration_number:registernumber});
        let updatestudentdetails = await StudentRegister.updateMany(
            {$_id:student._id},
            {$set:{  
                firstname: req.body.fname
                
            }}
        );
        failure=true;
        msg="Your details has been updated";
        res.redirect("/studentprofile");
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/studentprofile");
    }
})


app.get("/counsellorprofile",async(req,res)=>{
    try{    
        let counsellor = await CounsellorRegister.findOne({email:counselloremail});
        res.render("counsellorprofile",{failure:failure,msg:msg,email:counselloremail,counsellor:counsellor});
        failure=false;
        msg="";
    }catch(error){
        failure=true;
        msg=error;
        res.redirect("/counsellorprofile");
    }

})
// app.post("/studentprofile",async(req,res)=>{
//     try{
//         let student = await StudentRegister.findOne({registration_number:registernumber});
//         let updatestudentdetails = await StudentRegister.updateMany(
//             {$_id:student._id},
//             {$set:{  
//                 firstname: req.body.fname
                
//             }}
//         );
//         failure=true;
//         msg="Your details has been updated";
//         res.redirect("/studentprofile");
//     }catch(error){
//         failure=true;
//         msg=error;
//         res.redirect("/studentprofile");
//     }
// })

// app.get("/aboutus",(req,res)=>{
//     res.render("aboutus",{failure:failure,msg:msg,registernumber:registernumber});
//     failure=false;
//     msg="";
// })

app.listen(port,()=>{
    console.log(`Listening at port ${port} `);
})

