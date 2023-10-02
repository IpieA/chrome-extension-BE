import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { json, urlencoded } from 'express';
import recordingRouter from './routes/router.js';

dotenv.config({path: './config/.env'});
const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

app.use('/api/recordings', recordingRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server is running and listening on PORT ${PORT}`,
        `http://localhost:${PORT}`
    );
})