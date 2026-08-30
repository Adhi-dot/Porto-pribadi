export const Category = {
  SCHOOL: 'SCHOOL',
  COMPETITION: 'COMPETITION',
  TUTORING: 'TUTORING',
  PERSONAL: 'PERSONAL',
} as const;
export type Category = typeof Category[keyof typeof Category];

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;
export type Priority = typeof Priority[keyof typeof Priority];


export interface ParsedTask {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  estimatedMinutes: number;
  microTasks: string[];
}

export interface BrainDumpResult {
  message: string;
  tasks: ParsedTask[];
}

export class AIService {
  static async parseBrainDump(text: string): Promise<BrainDumpResult> {
    const lowerText = text.toLowerCase();

    // Check if Gemini API key is available and configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_api_key_here') {
      try {
        // Optional real LLM integration via fetch to Gemini API endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a supportive, friendly 13th-grade senior mentor (kakak kelas) helping an overwhelmed 11th-grade high school student who is stressed with school, competitions, tutoring, and personal life.
Analyze this student's brain dump: "${text}"

Return a valid JSON object ONLY (no markdown fences, pure JSON) with this exact structure:
{
  "message": "A warm, empathetic, motivational response in Indonesian like an encouraging older sibling (e.g. 'Woi santai, capek banget ya hari ini? Yuk kita beresin pelan-pelan...')",
  "tasks": [
    {
      "title": "Clear task title",
      "description": "Short description",
      "category": "SCHOOL" | "COMPETITION" | "TUTORING" | "PERSONAL",
      "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      "estimatedMinutes": 30,
      "microTasks": ["Step 1 (10 min)", "Step 2 (15 min)"]
    }
  ]
}`
              }]
            }]
          })
        });

        if (response.ok) {
          const data = await response.json() as any;
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            // Clean markdown code blocks if any
            const cleanJson = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            return parsed;
          }
        }
      } catch (err) {
        console.error('LLM API call failed, falling back to smart parser:', err);
      }
    }

    // Smart Heuristic Parser tailored for Indonesian High School Life
    const tasks: ParsedTask[] = [];

    // Split text by sentences or bullet points or conjunctions
    const sentences = text.split(/(?:\.|\n|dan juga|serta|terus|lalu)/i).filter(s => s.trim().length > 3);

    if (sentences.length === 0) {
      sentences.push(text);
    }

    for (const sentence of sentences) {
      const s = sentence.trim();
      let category: Category = Category.SCHOOL;
      let priority: Priority = Priority.MEDIUM;
      let estMinutes = 30;

      const sl = s.toLowerCase();
      if (sl.includes('lomba') || sl.includes('essay') || sl.includes('proposal') || sl.includes('olimpiade') || sl.includes('osn')) {
        category = Category.COMPETITION;
        priority = Priority.HIGH;
        estMinutes = 45;
      } else if (sl.includes('les') || sl.includes('bimbingan') || sl.includes('tutoring') || sl.includes('matematika') || sl.includes('fisika') || sl.includes('kimia')) {
        category = Category.TUTORING;
        priority = Priority.HIGH;
        estMinutes = 40;
      } else if (sl.includes('istirahat') || sl.includes('tidur') || sl.includes('makan') || sl.includes('nonton') || sl.includes('main') || sl.includes('jalan')) {
        category = Category.PERSONAL;
        priority = Priority.LOW;
        estMinutes = 20;
      } else {
        category = Category.SCHOOL;
        priority = sl.includes('besok') || sl.includes('sekarang') || sl.includes('kumpul') ? Priority.URGENT : Priority.MEDIUM;
        estMinutes = 30;
      }

      // Generate micro-tasks based on content
      const microTasks = [
        `Siapkan bahan/referensi utama (10 min)`,
        `Kerjakan inti tugas/latihan secara fokus (15 min)`,
        `Review akhir dan rapikan (5 min)`
      ];

      tasks.push({
        title: s.length > 50 ? s.substring(0, 47) + '...' : s,
        description: `Dibuat dari unek-unek: "${s}"`,
        category,
        priority,
        estimatedMinutes: estMinutes,
        microTasks
      });
    }

    // Motivational message ala Kakak Kelas
    const messages = [
      "Wah, keliatannya hari ini jadwal lu padat banget! Tarik napas dulu sebentar. Kita cicil pelan-pelan dari yang paling penting ya, lu pasti bisa nyelesaiin ini semua!",
      "Capek ya jadi anak kelas 11? Wajar banget kok kalau kewalahan. Biar gak pusing, tugas-tugas di atas udah gw pecah jadi bagian kecil-kecil biar gampang dikerjain. Yuk mulai satu-satu!",
      "Santai, bro/sis! Gak usah buru-buru dikerjain semua sekaligus. Fokus ke satu tugas dulu, nanti abis itu istirahat sebentar. Semangat ya!"
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return {
      message: randomMessage,
      tasks
    };
  }
}
