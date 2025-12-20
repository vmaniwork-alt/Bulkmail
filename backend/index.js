const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose=require("mongoose")
const { promises } = require("nodemailer/lib/xoauth2");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://maniofficial771_db_user:1EcmLzox91gTRJav@cluster0.lp1uofb.mongodb.net/passkey?appName=Cluster0").then(()=>{console.log("DB connected")})
.catch(()=>{console.log("DB failed")})

const credential=mongoose.model("credential",{},"bulkemail")


app.post("/sendmail", (req, res) => {
  const msg = req.body.msg
  const emailList = req.body.emailList
  credential.find().then((data)=>{
 const transporter = nodemailer.createTransport({
  service: "gmail",          // ✅ tells nodemailer to use Gmail
  auth: {
    user: data[0].toJSON().user, // ✅ sender email
    pass: data[0].toJSON().pass,       // ✅ Gmail App Password
  },
});
 new Promise(async (resolve, reject) => {
    try {
      for (let i = 0; i < emailList.length; i++) {
        await transporter.sendMail(
          {
            from: "johnsnowselboy@gmail.com",
            to: emailList[i],
            subject: "A message from bulkmail",
            text: msg,
          }

        )
        console.log("Email send to:" + emailList[i])
      
      }
        resolve("succesfull")

    } catch (error) {
      reject("failed")

    }


  }).then(() => res.send({ success: true }))
.catch((error) => res.send({ success: false, error: error.message }))



}).catch((error)=>{
  console.log(error)
})


})
const PORT = process.env.PORT || 5000

app.listen(PORT, function () {
    console.log(`Server running on port ${PORT}`)
})
