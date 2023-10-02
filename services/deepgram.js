import pkg from '@deepgram/sdk';
const { Deepgram } = pkg;
import { configDotenv } from 'dotenv';
import fs from 'fs';
configDotenv({path: './config/.env'});
const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

const transcribe = async (pathToFile) => {
    try {
      const deepgram = new Deepgram(deepgramApiKey);
      const mimetype = 'audio/mp3';
  
      const transcription = await deepgram.transcription.preRecorded(
        { buffer: fs.readFileSync(pathToFile), mimetype },
        { smart_format: true, model: 'nova', language: 'en-US' }
      );
  
      return transcription;
    } catch (err) {
      throw err;
    }
};
  

export { transcribe };
