import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import * as dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import userRouter from "./routes/user.routes.js";
import leadsRouter from "./routes/leads.routes.js";
import contactsRouter from "./routes/contacts.routes.js";
import serviceRouter from "./routes/service.routes.js";
import countsRouter from "./routes/counts.routes.js";

import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";


console.log(process.argv);
const app = express();
const PORT = process.env.PORT;

const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL);
await client.connect();
console.log("Your MongoDB is connected😍👍");
app.use(cors());

app.use(express.json());

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "tintyours@gmail.com",
    pass: "hibsyeemtuflqkzk",
  },
});

app.get("/", function (request, response) {
  response.send(`
    <style>
    body{
      background-color: gold;

    }
      h1 {
        font-family: sans-serif;
        color: black;
        text-align: center;
        text-shadow: 0 0 5px black;
        box-shadow: 2px 2px 50px black;
        padding: 20px;
        margin-top:4cm;
      }
      p{
        color:black;
        text-align: center;
        text-shadow: 0 0 5px black;
        font-family: sans-serif;
        font-size:1cm;
        font-weight:900;
        margin-top:2cm;

      }
    </style>
    <p>CRM App EndPoints</p>
    <h1>
      Leads Data - <a href="https://crm-node-delta.vercel.app/leads" style="color: #0000FF; text-shadow:none">https://crm-node-delta.vercel.app/leads</a><br><br>
      Contacts Data - <a href="https://crm-node-delta.vercel.app/contacts" style="color: #0000FF; text-shadow:none">https://crm-node-delta.vercel.app/contacts</a><br><br>
      Service Request Data - <a href="https://crm-node-delta.vercel.app/service-request" style="color: #0000FF; text-shadow:none">https://crm-node-delta.vercel.app/service-request</a><br><br>
      Count of All DB - <a href="https://crm-node-delta.vercel.app/api/counts" style="color: #0000FF; text-shadow:none">https://crm-node-delta.vercel.app/api/counts</a>
    </h1>
  `);
});

app.use("/users", userRouter);
app.use("/leads", leadsRouter);
app.use("/contacts", contactsRouter);
app.use("/service-request", serviceRouter);
app.use("/api", countsRouter);



app.post("/forgot-password", async (req, res) => {
  try {
    const user = await client.db("CRM").collection("users").findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    const resetURL = `https://funny-selkie-a56f6b.netlify.app/reset-password/${resetToken}`;

    const mailOptions = {
      from: "CRM@gmail.com",
      to: user.email,
      subject: "Reset Password",
      html: `
        <p>Please click the following link to reset your password:</p>
        <a href="${resetURL}">Reset Password</a>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/reset-password/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.SECRET_KEY);

    const user = await client.db("CRM").collection("users").findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user.password = hashedPassword;
    // await user.save();

    await client.db("CRM").collection("users").updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $set: { password: hashedPassword } }
    );
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid token" });
  }
});


export { client };

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
