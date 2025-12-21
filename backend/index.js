require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());

// Function to connect to MongoDB with retry
const connectWithRetry = async (retries = 5, delay = 3000) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ DB connected successfully!");
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    if (retries > 0) {
      console.log(`🔁 Retrying in ${delay / 1000} seconds... (${retries} attempts left)`);
      setTimeout(() => connectWithRetry(retries - 1, delay), delay);
    } else {
      console.error("❌ All retries exhausted. Could not connect to DB.");
    }
  }
};

// Start the connection
connectWithRetry();

// Example of your schema
const Credential = mongoose.model("credential", {}, "bulkemail");

// Routes...
app.post("/sendmail", async (req, res) => {
  try {
    const { msg, emailList } = req.body;
    const data = await Credential.find();

    if (!data.length) return res.status(400).send({ success: false, error: "No credentials found" });

    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].user,
        pass: data[0].pass,
      },
    });

    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: data[0].user,
        to: emailList[i],
        subject: "A message from bulkmail",
        text: msg,
      });
      console.log("Email sent to:", emailList[i]);
    }

    res.send({ success: true });
  } catch (error) {
    console.error("SendMail error:", error);
    res.status(500).send({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
