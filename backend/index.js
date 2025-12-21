require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// Check environment variables
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not defined! Add it in Render Environment Variables.");
}


const connectWithRetry = async (retries = 5, delay = 3000) => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // no useNewUrlParser or useUnifiedTopology
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

// Start the DB connection
connectWithRetry();


const Credential = mongoose.model("credential", {}, "bulkemail");



// Health Check
app.get("/health", (req, res) => {
  res.send({ status: "OK", db: mongoose.connection.readyState });
});

// Send Bulk Emails
app.post("/sendmail", async (req, res) => {
  try {
    const { msg, emailList } = req.body;

    if (!emailList || !emailList.length) {
      return res.status(400).send({ success: false, error: "Email list is empty" });
    }

    const data = await Credential.find();

    if (!data.length) return res.status(400).send({ success: false, error: "No credentials found" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].user,
        pass: data[0].pass,
      },
    });

    // Send emails in parallel
    await Promise.all(
      emailList.map((email) =>
        transporter.sendMail({
          from: data[0].user,
          to: email,
          subject: "BulkMail Message",
          text: msg,
        }).then(() => console.log("Email sent to:", email))
          .catch(err => console.error("Failed to send email to:", email, err.message))
      )
    );

    res.send({ success: true, message: "Emails sent successfully" });
  } catch (error) {
    console.error("SendMail error:", error.message);
    res.status(500).send({ success: false, error: error.message });
  }
});


// Start Server

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
