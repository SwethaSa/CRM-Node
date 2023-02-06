


import express from "express";
import { client } from "../index.js";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, city, state, status } = req.body;

    // Check if email already exists
    const existingUser = await client
      .db("CRM")
      .collection("lead")
      .findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "OOPS!!👀Email already exists" });
    }

    // Insert new lead into the database
    const user = await client.db("CRM").collection("lead").insertOne({
      name,
      email,
      phone,
      city,
      state,
      status,
    });

    // Get all the Admins and Managers from the database
    const users = await client.db("CRM").collection("users").find({
      $or: [{ type: "Admin" }, { type: "Manager" }],
    }).toArray();

    // Get the email addresses of all Admins and Managers
    const to = users.map((user) => user.email);

    // Check if there are any Admins or Managers
    if (to.length > 0) {
      // send an email to the respective email
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "tintyours@gmail.com",
          pass: "hibsyeemtuflqkzk",
        },
      });
      const mailOptions = {
        from: "CRM@gmail.com",
        to,
        subject: "New Lead Created ✔",
        text: `A new lead has been created with the following details:
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        City: ${city}
        State: ${state}
        Status: ${status}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }

    return res.status(201).json({ msg: "Lead created Successfully😍👍" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});




router.get("/", async (request, response) => {
  const leads = await client.db("CRM").collection("lead").find({}).toArray();

  response.send(leads);
});

router.put("/:email", async (req, res) => {
  try {
    const { name, phone, city, state, status } = req.body;
    // Check if email exists
    const existingUser = await client
      .db("CRM")
      .collection("lead")
      .findOne({ email: req.params.email });
    if (!existingUser) {
      return res.status(404).json({ msg: "Lead not found" });
    }

    await client
      .db("CRM")
      .collection("lead")
      .updateOne(
        { email: req.params.email },
        { $set: { name, phone, city, state, status } }
      );
    return res.status(200).json({ msg: "Lead updated successfully😍👍" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/:email", async (req, res) => {
  try {
    const deletedLead = await client
      .db("CRM")
      .collection("lead")
      .deleteOne({ email: req.params.email });
    if (deletedLead.deletedCount === 0) {
      return res.status(404).json({ msg: "Lead not found" });
    }
    return res.status(200).json({ msg: "Lead deleted successfully😍👍" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
