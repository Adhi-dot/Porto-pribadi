"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const aiService_js_1 = require("../services/aiService.js");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.post('/brain-dump', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({ error: 'Teks unek-unek / brain dump wajib diisi' });
        }
        // Call AI Service to parse and structure
        const result = await aiService_js_1.AIService.parseBrainDump(text);
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
    }
    catch (error) {
        console.error('Error processing brain dump:', error);
        res.status(500).json({ error: 'Gagal memproses brain dump dengan AI' });
    }
});
exports.default = router;
