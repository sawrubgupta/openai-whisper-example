//create a express server with 3000 listening port

import express from 'express';
import fs from 'fs';
import FormData from 'form-data';
import { Readable } from 'stream';
import axios from 'axios';
import multer from 'multer';
import {config} from './config.js';
import OpenAI from 'openai';


const upload = multer();


const app = express();

app.use(express.json());


const apiKey = config.OPEN_AI_API_KEY;


const openai = new OpenAI({
    apiKey: apiKey, // defaults to process.env["OPENAI_API_KEY"]
  });


app.get('/audioToText', async (req, res) => {

    try{
        const fileAudio = fs.readFileSync('example.mp3');
       // const base64Audio = fileAudio.toString('base64');

        const chatCompletion = await openai.audio.transcriptions.create({
            model: 'whisper-1',
            file: fileAudio
        })
    
     //   console.log(chatCompletion, "chatCompletion");
    
      //  console.log(JSON.stringify(chatCompletion), "chatCompletion");
    
        res.send(chatCompletion);


    }catch(e){
        console.log("ERROR", e);
        res.send("Something went wrong");
    }

    //read audio file


}
);


const  bufferToStream  = (buffer) => {
    return  Readable.from(buffer);
  }


app.post('/api/transcribe', upload.single('file'), async (req, res) => {
    
    try {

      
      const  audioFile  = req.file;
      if (!audioFile) {
        return res.status(400).json({ error: 'No audio file provided' });
      }
      const  formData  =  new FormData();
      const  audioStream  =  bufferToStream(audioFile.buffer);
      formData.append('file', audioStream, { filename: 'hindi.mp3', contentType: audioFile.mimetype });
      formData.append('model', 'whisper-1');
     // formData.append('language', 'hi');

      formData.append('response_format', 'json');
      const  config  = {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          "Authorization": `Bearer ${apiKey}`,
        },
      };
      // Call the OpenAI Whisper API to transcribe the audio
      const  response  =  await axios.post('https://api.openai.com/v1/audio/translations', formData, config);
      const  transcription  = response.data.text;
      res.json({ transcription });
    } catch (error) {
        console.log(error);
        console.log(JSON.stringify(error.response.data));

      res.status(500).json({ error: 'Error transcribing audio' });
    }
  });


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});