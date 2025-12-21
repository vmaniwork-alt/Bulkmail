import { useState } from "react"
import axios from "axios"
import * as XLSX from "xlsx"

function App() {

  const[msg,setmsg]=useState("")
  const [status,setstatus]=useState(false)
  const [emailList,setemailList]=useState("")

  const handleClick=(e)=>{
    setmsg(e.target.value)

  }

  const handleChange=(event)=>{
     const file = event.target.files[0]

    const reader = new FileReader()

    reader.onload = function(event){
        const data = event.target.result
        const workbook = XLSX.read(data,{type:"binary"})
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const emailList = XLSX.utils.sheet_to_json(worksheet,{header:"A"})
         const totalemail=emailList.map((item)=>{return item.A})
         setemailList(totalemail)
      
    }

    reader.readAsBinaryString(file);

  }


  const handleSend = () => {
  if (!msg || msg.trim().length === 0) {
    alert("Message cannot be empty!");
    return;
  }

  if (!emailList || emailList.length === 0) {
    alert("Email list cannot be empty!");
    return;
  }

  setstatus(true);

  // Ensure emailList is an array of strings
  const emailsArray = Array.isArray(emailList)
    ? emailList
    : emailList.split(",").map(e => e.trim());

  axios.post("http://localhost:5000/sendmail", { msg, emailList: emailsArray })
    .then((response) => {
      if (response.data.success) {
        alert("Email sent successfully");
        setmsg("");
      } else {
        alert("Failed to send: " + response.data.error);
      }
      setstatus(false);
    })
    .catch((error) => {
      alert("Error sending emails: " + (error.response?.data?.error || error.message));
      setstatus(false);
    });
};

  return (
    <>
    <div className="bg-gradient-to-b  from-[#cfe8f3] via-[#d7e6f2] to-[#e6dff2]  min-h-screen">
      <div className="flex justify-start mx-36 items-center p-5">
      <div className=' text-indigo-900 '>
        <h1 className="text-6xl font-bold px-5 py-3">BulkMail</h1>
      </div>
       <div className=' text-indigo-900 text-center items-center'>
        <h1 className="text-xl font-medium px-5 py-3">We can help your bussiness we can send multiple emails at onces</h1>
      </div>
       </div>
     
      <div className=" flex flex-col items-center text-black px-5 py-6 mt-6">
        <textarea onChange={handleClick} value={msg} className="w-[80%] h-32 py-2 
        focus:outline-none focus:ring-2  focus:ring-indigo-500
         hover:border-indigo-700 focus:border-indigo-600 border-none 
        shadow-lg px-3 rounded-lg border" 
        placeholder="Enter the Email Text...."></textarea>
         <div >
           <div className='text-gray-600 text-center'>
        <h1 className="text-xl font-medium px-5 py-3">Drag and Drop</h1>
      </div>
      <div className="bg-white w-[550px] p-6 rounded-xl shadow-lg">

  {/* Drag & Drop Box */}
  <label
    htmlFor="fileUpload"
    className="flex flex-col items-center justify-center
               h-[170px] border-2 border-dashed border-blue-400
               rounded-xl cursor-pointer
               hover:border-blue-600 hover:bg-blue-50
               transition-all duration-200"
  >
    <input
      id="fileUpload"
      type="file"
      onChange={handleChange}
      className="hidden"
      accept=".csv,.xlsx,.txt"
    />

    <span className="text-blue-500 text-4xl">☁️</span>
    <p className="text-slate-700 font-medium mt-2">
      Drag and Drop Your File Here
    </p>
    <p className="text-slate-400 text-sm">
      or click to browse
    </p>
  </label>
  <div className="flex items-center mt-3 justify-evenly">
   
  <p className="text-slate-600 text-sm ">
    Total Emails in the File : <span className="font-semibold">{emailList.length}</span>

  </p>
  <p className="text-xs text-red-400">Note:<span className="text-gray-400 px-1">Support Excel Sheet Only </span> </p>

  </div>

  

  {/* Send Button */}
  <button
    onClick={handleSend}
    disabled={status}
    className="mt-4 w-full bg-blue-950 text-white py-2 rounded-lg
               hover:bg-blue-900 transition-all duration-200
               disabled:opacity-60"
  >
    {status ? "Sending..." : "Send"}
  </button>

</div>
      </div>
      
       

      </div>

      
      
     
       
    
    
    </div>
     

    </>
  )
}

export default App
