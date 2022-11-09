const cron  = require("node-cron");
const Appointment = require("./db/models/appointment");

cron.schedule("*/2 * * * *",()=>
console.log("Hello")
);