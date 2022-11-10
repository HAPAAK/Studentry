/*
      1) Install Courier SDK: npm install @trycourier/courier
      2) Make sure you allow ES module imports: Add "type": "module" to package.json file 
      */
      //import { CourierClient } from "@trycourier/courier";
    //   const CourierClient = require("@trycourier/courier");
      
      
    //   const courier = CourierClient({ authorizationToken: "pk_prod_YPS2RK5XAX4H1CJ00HZF1QSD3S38"});
    //   async function run(){
    //         const { requestId } = await courier.send({
    //             message: {
    //             data:{
    //                 name:"ROshan",
    //             },
    //             content: {
    //                 title: "You have upcoming acitivities due!",
    //                 body: "Hi {{name}} , This is an reminder for your activites this scheduled on this date. "
    //             },
    //             to: {
    //                 email:"mahseratokpas118@gmail.com",
    //             }
    //             }
    //         });
    //     }
    const Allremainder = require("./db/models/reminders");
    
