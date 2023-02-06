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
    user: "digivantetesing@gmail.com",
    pass: "bpbfvjtteuwaqxwe",
  },
});

app.get("/", function (request, response) {
  response.send("🙋‍♂️, 🌏 🎊✨🤩");
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

    const resetURL = `http://localhost:3000/reset-password/${resetToken}`;

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
