
import express from 'express'
import * as dotenv from "dotenv";
dotenv.config();
import axios from 'axios';



const router = express.Router();

// const APILEADS = process.env.APILEADS;
// const APICONTACTS = process.env.APICONTACTS;
// const APISERVICE = process.env.APISERVICE;


router.get('/counts', async (req, res) => {
    try {
      const leadResponse = await axios.get('https://crm-node-ldfqg13sv-swethasa.vercel.app/leads');
      console.log(leadResponse.data);
      const leadCount = leadResponse.data.length;
      console.log(leadCount);
      
      const contactResponse = await axios.get('https://crm-node-ldfqg13sv-swethasa.vercel.app/contacts');
      console.log(contactResponse.data);
      const contactCount = contactResponse.data.length;
      console.log(contactCount);

      const serviceRequestResponse = await axios.get('https://crm-node-ldfqg13sv-swethasa.vercel.app/service-request');
      console.log(serviceRequestResponse.data);
      const serviceCount = serviceRequestResponse.data.length;
      console.log(serviceCount);
  
      const data = {
        leadCount,
        contactCount,
        serviceCount
      };
  
      res.json(data);
    } catch (error) {
      res.status(500).send(error);
    }
  });


  export default router;