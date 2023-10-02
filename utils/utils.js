import { v4 as uuidv4 } from 'uuid';
import ffprobeins from '@ffprobe-installer/ffprobe';
import ffmpegins from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import fs from "fs/promises";
import path from "path";

ffmpeg.setFfmpegPath(ffmpegins.path);
ffmpeg.setFfprobePath(ffprobeins.path);


const mergeVideo = (filepath, paths) => {
  return new Promise((resolve, reject) => {
    try {
      const command = ffmpeg();

      paths.forEach((path) => {
        command.input(path);
      });

      command.on('error', function (err) {
        reject(new Error(err));
      })
        .on('end', function () {
          resolve(filepath);
        });

      command.mergeToFile(filepath);
    } catch (error) {
      reject(new Error(error));
    }
  });
}

const extractAudio = (audioPath, videoPath) => {
  return new Promise((resolve, reject) => {
    try {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .on('error', function (err) {
          reject(new Error(err)); 
        })
        .on('end', function () {
          console.log('Audio extraction completed.');
          resolve(audioPath); 
        })
        .save(audioPath);
    } catch (error) {
      console.error('Error:', error);
      reject(new Error(error)); 
    }
  });
}

const generateUniqueId = (length) => {
    const uuid = uuidv4();
    const uniqueId = uuid.replace(/-/g, '').substring(0, length);
    return uniqueId;
}

async function getAllFilesInDirectory(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath);

    const filePaths = files.map((file) => path.join(directoryPath, file));

    return filePaths;
  } catch (error) {
    console.error('Error:', error);
    throw new Error(error);
  }
}

async function deleteChunkFiles(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath);

    // Iterate over the files and delete them one by one
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      await fs.unlink(filePath); // Delete the file
    }

    // Optionally, you can remove the directory itself
    await fs.rmdir(directoryPath);

  } catch (error) {
    console.error('Error deleting chunk files:', error);
    throw new Error(error);
  }
}

function extractTranscript(transcription) {
  let transcript = '';
  const results = transcription.data.results;
  if (results && results.channels && results.channels.length > 0) {
    const channel = results.channels[0];
    if (channel.alternatives && channel.alternatives.length > 0) {
      transcript = channel.alternatives[0].transcript;
    }
  }
  return transcript;
}

export {
  mergeVideo,
  extractAudio,
  generateUniqueId,
  getAllFilesInDirectory,
  extractTranscript,
  deleteChunkFiles
}