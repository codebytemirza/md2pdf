import express from 'express';
import cors from 'cors';
import apiRouter from '../src/api.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api', apiRouter);

export default app;
