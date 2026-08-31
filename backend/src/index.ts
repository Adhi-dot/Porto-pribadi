import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tasksRouter from './routes/tasks.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', tasksRouter);
app.use('/api/ai', aiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'The 11th-Grade War Room Backend' });
});

app.listen(PORT, () => {
  console.log(`🛡️ War Room Backend is running on http://localhost:${PORT}`);
});
