import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(['SCHOOL', 'COMPETITION', 'TUTORING', 'PERSONAL']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().optional(),
  estimatedMinutes: z.number().optional(),
  microTasks: z.array(z.string()).optional()
});

// Get all tasks with microTasks
router.get('/', async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      include: { microTasks: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Gagal mengambil daftar tugas' });
  }
});

// Create task
router.post('/', async (req: Request, res: Response) => {
  try {
    const validation = createTaskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    const { title, description, category, priority, dueDate, estimatedMinutes, microTasks } = validation.data;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        category: category || 'SCHOOL',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedMinutes: estimatedMinutes || 30,
        microTasks: microTasks ? {
          create: microTasks.map(mt => ({ title: mt }))
        } : undefined
      },
      include: { microTasks: true }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Gagal membuat tugas baru' });
  }
});

// Update task status or details
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, title, description, priority, category } = req.body;

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(category && { category })
      },
      include: { microTasks: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Gagal memperbarui tugas' });
  }
});

// Toggle microtask
router.patch('/microtasks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const updated = await prisma.microTask.update({
      where: { id },
      data: { completed }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating microtask:', error);
    res.status(500).json({ error: 'Gagal memperbarui sub-tugas' });
  }
});

// Delete task
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Tugas berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Gagal menghapus tugas' });
  }
});

export default router;
