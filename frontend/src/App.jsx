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


  const handleSend=()=>{
    setstatus(true)
    axios.post("http://localhost:5000/sendmail",{msg:msg,emailList:emailList})
   .then((response) => {
    // Assuming backend returns { success: true } on success
    if (response.data.success) {
      alert("Email sent successfully");
      setmsg("");          // Clear the message
      setstatus(false);    // Reset sending status
    } else {
      alert("Failed to send: " + response.data.error);
      setstatus(false);
    }
  })
  .catch((error) => {
    // Handles network/server errors
    alert("Error sending emails: " + error.message);
    setstatus(false);
  }
  )}

  return (
    <>
     <div>
      <div className='bg-blue-950 text-white text-center'>
        <h1 className="text-2xl font-medium px-5 py-3">BulkMail</h1>
      </div>
       <div className='bg-blue-800 text-white text-center'>
        <h1 className="text-xl font-medium px-5 py-3">We can help your bussiness we can send multiple emails at onces</h1>
      </div>
      <div className='bg-blue-600 text-white text-center'>
        <h1 className="text-xl font-medium px-5 py-3">Drag and Drop</h1>
      </div>
      <div className="bg-blue-400 flex flex-col items-center text-black px-5 py-3">
        <textarea onChange={handleClick} value={msg} className="w-[80%] h-32 py-2 outline-none px-3 rounded-md border border-black" placeholder="Enter the Email Text...."></textarea>
         <div >
        <input onChange={handleChange} type="file" className="px-2 py-2 border-4 border-dotted mt-3 mb-5"></input>
       
      </div>
       <p>Total Emails in the File :{emailList.length}</p>
       <button onClick={handleSend} className="bg-blue-950 text-white px-2 py-2 mt-2 rounded-md">{status?"sending...":"send"}</button>
    </div>
           <div className='bg-blue-500 text-white text-center py-26'>
       
      </div>
      
      
     
       
     </div>
      <div className='bg-blue-800 text-white text-center py-16'>
       
      </div>
      <div className='bg-blue-600 text-white text-center py-16'>
       
      </div>

    </>
  )
}

export default App
