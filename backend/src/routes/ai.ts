import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AIService } from '../services/aiService.js';

const prisma = new PrismaClient();
const router = Router();

router.post('/brain-dump', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Teks unek-unek / brain dump wajib diisi' });
    }

    // Call AI Service to parse and structure
    const result = await AIService.parseBrainDump(text);

    // Automatically save parsed tasks to database
    const savedTasks = [];
    for (const t of result.tasks) {
      const created = await prisma.task.create({
        data: {
          title: t.title,
          description: t.description,
          category: t.category,
          priority: t.priority,
          estimatedMinutes: t.estimatedMinutes,
          microTasks: {
            create: t.microTasks.map(mt => ({ title: mt }))
          }
        },
        include: { microTasks: true }
      });
      savedTasks.push(created);
    }

    res.json({
      message: result.message,
      tasks: savedTasks
    });
  } catch (error) {
    console.error('Error processing brain dump:', error);
    res.status(500).json({ error: 'Gagal memproses brain dump dengan AI' });
  }
});

export default router;
