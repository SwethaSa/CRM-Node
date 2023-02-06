import express from "express";
import { client } from "../index.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, city, state, company } = req.body;
    // Check if email already exists
    const existingUser = await client
      .db("CRM")
      .collection("contact")
      .findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "OOPS!!👀Email already exists" });
    }

    const user = await client.db("CRM").collection("contact").insertOne({
      name,
      email,
      phone,
      city, state,
      company,
    });
    return res.status(201).json({ msg: "Contact created Successfully😍👍" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/", async (request, response) => {
  const contacts = await client.db("CRM").collection("contact").find({}).toArray();

  response.send(contacts);
});

router.put("/:email", async (req, res) => {
  try {
    const { name, phone, city, state, company } = req.body;
    // Check if email exists
    const existingUser = await client
      .db("CRM")
      .collection("contact")
      .findOne({ email: req.params.email });
    if (!existingUser) {
      return res.status(404).json({ msg: "contact not found" });
    }

    await client
      .db("CRM")
      .collection("contact")
      .updateOne(
        { email: req.params.email },
        { $set: { name, phone, city, state, company } }
      );
    return res.status(200).json({ msg: "Contact updated successfully😍👍" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/:email", async (req, res) => {
  try {
    const deletedcontact = await client
      .db("CRM")
      .collection("contact")
      .deleteOne({ email: req.params.email });
    if (deletedcontact.deletedCount === 0) {
      return res.status(404).json({ msg: "Contact not found" });
    }
    return res.status(200).json({ msg: "Contact deleted successfully😍👍" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
