
const Allreminder = require("./db/models/reminders");
const sgMail = require('@sendgrid/mail');
const API_KEY = "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";
sgMail.setApiKey(API_KEY);
const cron = require("node-cron");

async function mailsenderfunction(allreminderevent){
  const createdBy = allreminderevent.createdBy;
  const remindertype = allreminderevent.remindertype;
  const senderemail1 = allreminderevent.beneficiaryemail;
  let originaldate;
  let remindertext;
  if(remindertype==="Event"){
    const event = await allreminderevent.populate("events");
    originaldate = event.eventdate;
    remindertext = `You have a event titled: ${event.eventname} at ${originaldate}`;
  }else if (remindertype == "Appointment"){
    const appointment = await allreminderevent.populate("appointment");
    originaldate = appointment.date;
    remindertext = `You have a appointment on: ${appointment.venue_type} at ${originaldate} with your counsellor ${createdBy}`;
  }
  const msg = {
    to: senderemail1,
    from: 'mahseratokpas118@gmail.com', // Use the email address or domain you verified above
    subject: `Reminder for your ${remindertype}`,
    text:remindertext,
    html: '<strong>{{remindertext}}</strong>',
  };
  //ES8
  (async () => {
    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error(error);
      
      if (error.response) {
        console.error(error.response.body)
      }
    }
  });
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
