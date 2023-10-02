import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { 
  mergeVideo,
  extractAudio,
  generateUniqueId,
  getAllFilesInDirectory,
  extractTranscript,
  deleteChunkFiles
} from "../utils/utils.js";
import { transcribe } from "../services/deepgram.js";``

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFilePath);
const parentDirectory = path.resolve(currentDirectory, '..');
const recordingsDirectory = path.join(parentDirectory, 'recordings');

function myPath(filename) {
  return path.join(recordingsDirectory, filename)
}

//Controllers start here

export async function startRecording(req, res) {
  try {
    const uniqueId = generateUniqueId(8);
    const directoryPath = path.join(currentDirectory, uniqueId);

    await fs.mkdir(directoryPath, { recursive: true });
    
    console.log('Directory created:', directoryPath);
    res.status(201).json({
      success: true,
      id: uniqueId
    });
  } catch (err) {
    console.error('Error creating folder:', err);
    res.status(500).send({
      success: false,
      message: "Internal Server Error"
    });
  }
}


export async function sendChunk(req, res) {
    const { id } = req.params;
  
    if (!id) {
      return res.status(401).json({
        sucess: false,
        message: "Please provide an id"
      });
    }
  
    const data = [];
  
    for await (const chunk of req) {
      data.push(chunk);
    }
  
    try {
      const directoryPath = path.join(
        recordingsDirectory,
        id,
        `${generateUniqueId(4)}.webm`
      );
  
      // Ensure the directory exists; if not, create it
      await fs.mkdir(path.dirname(directoryPath), { recursive: true });
  
      const chunkBuffer = Buffer.concat(data);
  
      // Save the uploaded MP4 data
      await fs.writeFile(directoryPath, chunkBuffer);
  
      res.status(201).json({
        sucess: true,
        temp_chunk_path: directoryPath,
      });
    } catch (err) {
      console.error('Error savingfile:', err);
      res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
      });
    }
}


export async function stopRecording(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(401).json({
      sucess: false,
      message: "Please provide an id"
    });
  }

  try {
    const video = await mergeVideo(myPath(`${id}.webm`), await getAllFilesInDirectory(myPath(id)));
    const audio = await extractAudio(myPath(`${id}.mp3`), video);
    const transcription = await transcribe(audio);


    await deleteChunkFiles(myPath(id));

    return res.status(200).json({
      success: true,
      data: {
        video_path: video,
        audio_path: audio,
        transcription: transcription
      },
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getRecordingAndTranscript(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(401).json({
      success: false,
      message: "Please provide an id"
    });
  }

  try {
    // Construct the paths to the merged video and transcription file
    const videoPath = path.join(recordingsDirectory, id + '.webm');
    const transcriptionPath = path.join(recordingsDirectory, id + '.json');

    // Check if the video and transcription files exist
    await fs.access(videoPath);

    // Check if the transcript file exists
    await fs.access(transcriptionPath);

    // Read the video file as a stream and send it as a response
    const videoStream = fs.createReadStream(videoPath);
    res.setHeader('Content-Type', 'video/webm');
    videoStream.pipe(res);

    // Read the transcription JSON file and parse it
    const transcriptionData = fs.readFileSync(transcriptionPath, 'utf8');
    const transcription = JSON.parse(transcriptionData);

    // Extract the transcript from the transcription object
    const transcript = extractTranscript(transcription);

    res.status(200).json({
      success: true,
      data: {
        transcript: transcript,
      },
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}
