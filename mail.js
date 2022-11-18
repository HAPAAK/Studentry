

const Allreminder = require("./db/models/reminders");
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(API_KEY);
const cron = require("node-cron");

async function mailsenderfunction(allreminderevent){
  //console.log(allreminderevent);
  const createdBy = allreminderevent.createdBy;
  const remindertype = allreminderevent.remindertype;
  const senderemail1 = allreminderevent.beneficiaryemail;
  let originaldate;
  let remindertext;
  if(remindertype==="Event"){
    const event = await allreminderevent.populate("events");
    const d = new Date(event.events.eventdate);
    originaldate= d.toLocaleString();
    remindertext = `You have a event titled: ${event.events.eventname} at ${originaldate}`;
  }else if (remindertype === "Appointment"){
    const appointments = await allreminderevent.populate("appointment");
    const d  = new Date(appointments.appointment.date);
    originaldate = d.toLocaleString();
    remindertext = `You have a appointment on: ${appointments.appointment.venue_type} at ${originaldate} with your counsellor ${createdBy}`;
  }
  //console.log(createdBy+ originaldate+senderemail1+remindertext);
  const msg = {
    to: senderemail1,
    from: 'mahseratokpas118@gmail.com', // Use the email address or domain you verified above
    subject: `Reminder for your ${remindertype} ${remindertext}`,
    text:remindertext,
    html: '<strong>This is an reminder for you due activities.</strong>',
  };
  console.log(msg);
  //ES8
  (async () => {
    try {
      console.log("hello");
      await sgMail.send(msg);
      await Allreminder.deleteOne({_id:allreminderevent._id});
      console.log("Mail sent");
    } catch (error) {
      console.error(error);
      
      if (error.response) {
        console.error(error.response.body)
      }
    }
  })();
}
async function check_eventfor_reminder(){
  const allreminderevents = await Allreminder.find({});
  console.log(allreminderevents);
  const len = allreminderevents.length;
  if(len!=0){
    const sysdate = new Date().getDate();
    console.log(sysdate);
    const systime = new Date().getTime();
    console.log(systime);
    for(let i=0;i<len;i++){
       const reminderdatetime = allreminderevents[i].reminderdate;
        const new_reminderdate = new Date(reminderdatetime);
        if(sysdate >= new_reminderdate.getDate()){
          if(systime >= new_reminderdate.getTime()){
            console.log("found");
            mailsenderfunction(allreminderevents[i]);
          }else{
            console.log("Time has not been reached")
          }
        }else{
          console.log("Date has not been reached");
        }
    }
  }else{
    console.log("There are no events");
  }
}
//*/3 * * * *
cron.schedule("*/1 * * * *",()=>{
  console.log("hello");
  check_eventfor_reminder();
})
