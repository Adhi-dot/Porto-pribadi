import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tasksRouter from './routes/tasks.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', tasksRouter);
app.use('/api/ai', aiRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ message: '11th-Grade War Room API is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
