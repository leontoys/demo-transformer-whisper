import { useState } from 'react'
import './App.css'
import { HfInference } from "@huggingface/inference";

function App() {

  const [filePath,setFilePath] = useState("")
  const [text,setText] = useState("")

  const handleFileChange = (e)=>{
    console.log("filepath",e.target.files[0])
    setFilePath(e.target.files[0])
  }

  const fileLoaded = async (e)=>{

    const result = e.target.result

    const hf_key = import.meta.env.VITE_HF

    const client = new HfInference(hf_key); 
  
    //convert array buffer to blog
    const data = new Blob([result],{ type: "audio/wav" })
    
    try {

      const output = await client.automaticSpeechRecognition({
        data,
        model: "openai/whisper-large-v3",
        provider: "hf-inference",
      });     

      if(output){
        setText(output.text)
      }
      else{
        setText("Not able to transcribe at the moment.Please try later")
      }
      
    } catch (error) {

      console.error("Error",error)
      
    }
    

  }

  const fileFetch = async(e)=>{

    const result = filePath
    console.log("result",result)

    const hf_key = import.meta.env.VITE_HF
  
    //convert array buffer to blog
    let data = new Blob([result],{ type: result.type })
    console.log("audio-data",data)

    data = data.slice(0,2000000)

    const endpoint =
    import.meta.env.MODE === 'development'
      ? "/api/hf-inference/models/openai/whisper-large-v3-turbo"
      : "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3-turbo"    
      
    console.log("endpoint",endpoint)
    
    try {
      
      const response = await fetch(
        endpoint,
        {
          headers: {
            Authorization: `Bearer ${hf_key}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: data,
        }
      );

      console.log("response",response)
      
      const transcript = await response.json();  

      console.log("transcript",transcript)

      setText(transcript.text)


    } catch (error) {
      console.error(error)
    }

  }

  const handleFileUpload = async (e)=>{
    
    const reader = new FileReader()

    reader.addEventListener("load",fileFetch)

    reader.readAsArrayBuffer(filePath)
    
  }
  

  return (
    <div className='App'>
      <h1>Speech to Text</h1>
      <input type='file' onChange={handleFileChange}></input>
      <button type='submit' onClick={handleFileUpload}>Transcribe</button>
      <textarea value={text} placeholder='Transcribed text will appear here...'></textarea>
    </div>
  )
}

export default App
