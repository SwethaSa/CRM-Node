


import express from "express";
import { client } from "../index.js";
import nodemailer from "nodemailer";

const router = express.Router();



// Service Request Route
router.post("/", async (req, res) => {
  const { name, email, phone, description, status } = req.body;

  // Validate Request Body
  if (!name || !email || !phone || !description || !status) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  const existingUser = await client
  .db("CRM")
  .collection("service")
  .findOne({ email });
if (existingUser) {
  return res.status(400).json({ msg: "OOPS!!👀Email already exists" });
}

const service = await client.db("CRM").collection("service").insertOne({
    name, email, phone, description, status
});

// Get all the Admins and Managers from the database
const users = await client.db("CRM").collection("users").find({
    $or: [{ type: "Admin" }, { type: "Manager" }],
  }).toArray();

  const to = users.map((user) => user.email);

  if (to.length > 0) {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "digivantetesing@gmail.com",
        pass: "chabkknqjcouolfc",
      },
    });
    const mailOptions = {
      from: "CRM@gmail.com",
      to,
      subject: "New Service Request Created ✔",
      text: `A new Service Request has been created with the following details:
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Description: ${description}
      status: ${status}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
  return res.json({ msg: "Service Request Submitted Successfully" });
});


router.get("/", async (request, response) => {
    const service = await client.db("CRM").collection("service").find({}).toArray();
  
    response.send(service);
  });

  router.delete("/:email", async (req, res) => {
    try {
      const deletedLead = await client
        .db("CRM")
        .collection("service")
        .deleteOne({ email: req.params.email });
      if (deletedLead.deletedCount === 0) {
        return res.status(404).json({ msg: "Request not found" });
      }
      return res.status(200).json({ msg: "Request deleted successfully😍👍" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  
export default router;

