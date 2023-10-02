import express from 'express';
const router = express.Router();

import {
    startRecording,
    sendChunk,
    stopRecording,
    getRecordingAndTranscript
} from '../controllers/recordingsController.js';

// Start recording
router.post('/start', startRecording);

// Send video data chunk
router.post('/send-chunk/:id', sendChunk);

// Stop recording and trigger transcription
router.post('/stop/:id', stopRecording);

//get recording and transcriptions
router.get('/:id', getRecordingAndTranscript);

export default router;
