const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

// ❌ REMOVED (THIS WAS THE ERROR)
// const { Promise } = require("nodemailer/lib/xoauth2");

const app = express();
app.use(express.json());
app.use(cors());

/* ---------------- MongoDB Connection ---------------- */
mongoose
  .connect(
    "mongodb+srv://maniofficial771_db_user:1EcmLzox91gTRJav@cluster0.lp1uofb.mongodb.net/passkey?appName=Cluster0"
  )
  .then(() => {
    console.log("DB connected");
  })
  .catch(() => {
    console.log("DB failed");
  });

/* ---------------- Model ---------------- */
const credential = mongoose.model("credential", {}, "bulkemail");

/* ---------------- Send Mail API ---------------- */
app.post("/sendmail", (req, res) => {
  const msg = req.body.msg;
  const emailList = req.body.emailList;

  credential
    .find()
    .then((data) => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: data[0].toJSON().user,
          pass: data[0].toJSON().pass,
        },
      });

      // ✅ KEEPING YOUR Promise LOGIC (NO CHANGE)
      new Promise(async (resolve, reject) => {
        try {
          for (let i = 0; i < emailList.length; i++) {
            await transporter.sendMail({
              from: "johnsnowselboy@gmail.com",
              to: emailList[i],
              subject: "A message from bulkmail",
              text: msg,
            });

            console.log("Email send to: " + emailList[i]);
          }
          resolve("successful");
        } catch (error) {
          reject(error);
        }
      })
        .then(() => res.send({ success: true }))
        .catch((error) =>
          res.send({ success: false, error: error.message })
        );
    })
    .catch((error) => {
      console.log(error);
      res.send({ success: false });
    });
});

/* ---------------- Server ---------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log(`Server running on port ${PORT}`);
});