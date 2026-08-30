import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  BookOpen,
  Trophy,
  GraduationCap,
  Heart,
  Clock,
  Trash2,
  CheckCircle2,
  Circle,
  Brain,
  ChevronRight,
  X,
  AlertCircle,
  PlusCircle,
  Smile,
  ShieldAlert,
  Frown
} from 'lucide-react';

// Types matching Backend Prisma and TS types
interface MicroTask {
  id: string;
  title: string;
  completed: boolean;
  taskId: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  category: 'SCHOOL' | 'COMPETITION' | 'TUTORING' | 'PERSONAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string | null;
  estimatedMinutes: number;
  microTasks: MicroTask[];
  createdAt: string;
  updatedAt: string;
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:5000/api';

export default function App() {
  const queryClient = useQueryClient();
  const [brainDumpText, setBrainDumpText] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [advisorMessage, setAdvisorMessage] = useState<string | null>(
    'Halo dek! Aku Kakak Kelas mentor kamu. Kalo lagi pusing atau burnout sama tugas sekolah, olimpiade, les, atau apa pun, ketikin aja semuanya di kolom curhatan di bawah. Nanti biar Kakak bantu beresin pelan-pelan!'
  );

  // Manual task states
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualCategory, setManualCategory] = useState<'SCHOOL' | 'COMPETITION' | 'TUTORING' | 'PERSONAL'>('SCHOOL');
  const [manualPriority, setManualPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [manualEstMinutes, setManualEstMinutes] = useState(30);

  // Fetch Tasks
  const { data: tasks = [], isLoading, isError } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/tasks`);
      if (!res.ok) throw new Error('Gagal mengambil daftar tugas');
      return res.json();
    }
  });

  // Submit Brain Dump Mutation
  const brainDumpMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`${API_BASE}/ai/brain-dump`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error('Gagal memproses brain dump');
      return res.json() as Promise<{ message: string; tasks: Task[] }>;
    },
    onSuccess: (data) => {
      setBrainDumpText('');
      setAdvisorMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  // Create Manual Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: async (newTask: Partial<Task> & { microTasks?: string[] }) => {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      if (!res.ok) throw new Error('Gagal membuat tugas manual');
      return res.json() as Promise<Task>;
    },
    onSuccess: () => {
      setManualTitle('');
      setManualDesc('');
      setManualCategory('SCHOOL');
      setManualPriority('MEDIUM');
      setManualEstMinutes(30);
      setShowAddManual(false);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  // Update Task Status Mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Task['status'] }) => {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Gagal memperbarui status tugas');
      return res.json() as Promise<Task>;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (selectedTask?.id === updated.id) {
        setSelectedTask(updated);
      }
    }
  });

  // Toggle Microtask Mutation
  const toggleMicrotaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await fetch(`${API_BASE}/tasks/microtasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      if (!res.ok) throw new Error('Gagal memperbarui sub-tugas');
      return res.json() as Promise<MicroTask>;
    },
    onSuccess: (updatedMicroTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Update selected task reference
      if (selectedTask) {
        const updatedMicroTasks = selectedTask.microTasks.map((mt) =>
          mt.id === updatedMicroTask.id ? { ...mt, completed: updatedMicroTask.completed } : mt
        );
        setSelectedTask({ ...selectedTask, microTasks: updatedMicroTasks });
      }
    }
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Gagal menghapus tugas');
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (selectedTask?.id === id) {
        setSelectedTask(null);
      }
    }
  });

  const handleBrainDumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brainDumpText.trim()) return;
    brainDumpMutation.mutate(brainDumpText);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;
    createTaskMutation.mutate({
      title: manualTitle,
      description: manualDesc,
      category: manualCategory,
      priority: manualPriority,
      estimatedMinutes: manualEstMinutes,
      microTasks: [
        'Langkah 1: Kumpulkan referensi (10 mnt)',
        'Langkah 2: Kerjakan porsi utama tugas (15 mnt)',
        'Langkah 3: Cek ulang & bereskan (5 mnt)'
      ]
    });
  };

  // Helper values
  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');
  const urgentTasksCount = pendingTasks.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH').length;

  // Sanity Meter Calculation
  const maxSafePendingTasks = 6;
  const loadPercentage = Math.min(100, Math.round((pendingTasks.length / maxSafePendingTasks) * 100));

  let sanityStatus = {
    title: 'Aman & Terkendali',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    bgLight: 'bg-emerald-50',
    tip: 'Beban tugas kamu masih wajar. Jangan lupa tetap luangkan waktu santai buat nonton atau main game ya!',
    icon: <Smile className="w-8 h-8 text-emerald-600" />
  };

  if (pendingTasks.length > 5) {
    sanityStatus = {
      title: 'Hati-hati Burnout!',
      color: 'bg-rose-500',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200',
      bgLight: 'bg-rose-50',
      tip: 'Kerjaan kamu numpuk banget dek! Tolong ambil napas dalam-dalam, minum air putih, dan cicil satu tugas kecil aja dulu. Jangan dipaksa sekaligus.',
      icon: <ShieldAlert className="w-8 h-8 text-rose-600" />
    };
  } else if (pendingTasks.length > 3 || urgentTasksCount >= 2) {
    sanityStatus = {
      title: 'Beban Agak Padat',
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      bgLight: 'bg-amber-50',
      tip: 'Ada beberapa hal penting yang harus selesai segera. Prioritaskan yang paling mepet (Urgent) dulu, baru lainnya.',
      icon: <AlertCircle className="w-8 h-8 text-amber-600" />
    };
  }

  // Categories list
  const categoriesList = [
    { key: 'SCHOOL', label: 'Sekolah', icon: <BookOpen className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800' },
    { key: 'COMPETITION', label: 'Lomba', icon: <Trophy className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800' },
    { key: 'TUTORING', label: 'Les & Tutoring', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-amber-100 text-amber-800' },
    { key: 'PERSONAL', label: 'Rest & Pribadi', icon: <Heart className="w-4 h-4" />, color: 'bg-rose-100 text-rose-800' }
  ] as const;

  const priorityColors = {
    LOW: 'bg-slate-100 text-slate-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700 border border-orange-200',
    URGENT: 'bg-rose-100 text-rose-700 animate-pulse border border-rose-300 font-bold'
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Header Banner */}
      <header className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">11th-Grade War Room 🛡️</h1>
              <p className="text-indigo-100 text-xs md:text-sm">Bantu Beresin Kerjaan Sekolah & Lomba Tanpa Overwhelm</p>
            </div>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-white/10">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>Pendamping Kelas 11 Terbaikmu</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Hand Column: AI Dump + Sanity Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Sibling Advice Card */}
          {advisorMessage && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-violet-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-violet-50 text-violet-600 px-3 py-1 rounded-bl-xl text-xs font-semibold">
                Pesan Kakak Kelas 💬
              </div>
              <div className="flex items-start gap-3 mt-2">
                <div className="bg-violet-100 p-2 rounded-full shrink-0 text-violet-700 font-bold text-sm">
                  Kak
                </div>
                <div>
                  <p className="text-sm italic leading-relaxed text-slate-600">
                    "{advisorMessage}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sibling Brain Dump Box */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Curahkan Pusingmu di Sini
            </h2>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Tulis keluh kesahmu, tugas menumpuk, atau persiapan lomba apa pun pakai bahasa santai. AI Kakak Kelas bakal merapikannya jadi tugas-tugas kecil.
            </p>

            <form onSubmit={handleBrainDumpSubmit} className="flex flex-col gap-3">
              <textarea
                value={brainDumpText}
                onChange={(e) => setBrainDumpText(e.target.value)}
                placeholder="Contoh: Duh capek banget kelas 11. Besok harus kumpul pr fisika hal 42, lusa ada presentasi proposal lomba esai bio di kampus sebelah, terus malam ini ada les matematika jam 7..."
                className="w-full h-36 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                disabled={brainDumpMutation.isPending}
              />
              <button
                type="submit"
                disabled={brainDumpMutation.isPending || !brainDumpText.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                {brainDumpMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Kakak Kelas Lagi Mikirin...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Urai Jadi Tugas Ringan ✨</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sanity Meter Box */}
          <div className={`rounded-2xl p-6 shadow-sm border ${sanityStatus.borderColor} ${sanityStatus.bgLight} transition-all duration-300`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sanity Meter</h3>
                <h2 className={`text-xl font-bold ${sanityStatus.textColor}`}>{sanityStatus.title}</h2>
              </div>
              {sanityStatus.icon}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden mb-4">
              <div
                className={`h-full transition-all duration-500 ${sanityStatus.color}`}
                style={{ width: `${loadPercentage}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs mb-3 text-slate-600">
              <span>Beban Tugas: {pendingTasks.length} Belum Selesai</span>
              <span>Batas Nyaman: {maxSafePendingTasks}</span>
            </div>

            <div className="bg-white/70 rounded-xl p-3 border border-slate-200/50 text-xs leading-relaxed text-slate-600">
              <strong>Tips Kakak Kelas:</strong> {sanityStatus.tip}
            </div>
          </div>
          
        </div>

        {/* Right Columns: The War Room Board Grid */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800">War Room Dashboard ⚔️</h2>
              <p className="text-xs text-slate-500">Klik tugas buat melihat detail sub-tugasnya</p>
            </div>
            
            <button
              onClick={() => setShowAddManual(!showAddManual)}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-indigo-500" />
              Tulis Tugas Manual
            </button>
          </div>

          {/* Manual Form Toggle */}
          {showAddManual && (
            <form onSubmit={handleManualSubmit} className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex flex-col gap-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-indigo-950">Tulis Tugas Baru Secara Manual</h3>
                <button type="button" onClick={() => setShowAddManual(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Nama Tugas</label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Contoh: Kumpul PR Sejarah"
                    className="p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Catatan Singkat</label>
                  <input
                    type="text"
                    value={manualDesc}
                    onChange={(e) => setManualDesc(e.target.value)}
                    placeholder="Contoh: Bab 4 halaman 10-12"
                    className="p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Kategori</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as any)}
                    className="p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  >
                    <option value="SCHOOL">Sekolah</option>
                    <option value="COMPETITION">Lomba / Kompetisi</option>
                    <option value="TUTORING">Les & Tutoring</option>
                    <option value="PERSONAL">Rest & Pribadi</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Prioritas</label>
                  <select
                    value={manualPriority}
                    onChange={(e) => setManualPriority(e.target.value as any)}
                    className="p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  >
                    <option value="LOW">Rendah (Low)</option>
                    <option value="MEDIUM">Sedang (Medium)</option>
                    <option value="HIGH">Tinggi (High)</option>
                    <option value="URGENT">Mendesak (Urgent)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Estimasi Waktu (Menit)</label>
                  <input
                    type="number"
                    value={manualEstMinutes}
                    onChange={(e) => setManualEstMinutes(parseInt(e.target.value) || 30)}
                    min={5}
                    className="p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-1.5"
              >
                {createTaskMutation.isPending ? 'Menyimpan...' : 'Simpan Tugas'}
              </button>
            </form>
          )}

          {/* Cards Columns by Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoriesList.map((cat) => {
              const categoryTasks = tasks.filter((t) => t.category === cat.key);

              return (
                <div key={cat.key} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col min-h-[250px]">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg ${cat.color}`}>
                        {cat.icon}
                      </span>
                      <span className="font-bold text-sm text-slate-800">{cat.label}</span>
                    </div>
                    <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {categoryTasks.length} Tugas
                    </span>
                  </div>

                  {/* Tasks List inside Category */}
                  <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[350px]">
                    {isLoading ? (
                      <div className="text-center text-slate-400 text-xs py-8">Memuat tugas...</div>
                    ) : categoryTasks.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-8 gap-1.5 text-center">
                        <Smile className="w-8 h-8 opacity-40" />
                        <span className="text-[11px] font-medium">Kosong dehh. Bagus!</span>
                      </div>
                    ) : (
                      categoryTasks.map((task) => {
                        const isDone = task.status === 'COMPLETED';
                        const completedSteps = task.microTasks.filter(m => m.completed).length;
                        const totalSteps = task.microTasks.length;

                        return (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className={`p-3.5 rounded-xl border text-left cursor-pointer transition relative group ${
                              selectedTask?.id === task.id
                                ? 'border-indigo-500 bg-indigo-50/20 ring-1 ring-indigo-500'
                                : 'border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Yakin ingin menghapus tugas ini?')) {
                                    deleteTaskMutation.mutate(task.id);
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-0.5 rounded transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <h3 className={`text-sm font-bold leading-snug mb-1 text-slate-900 ${isDone ? 'line-through text-slate-400' : ''}`}>
                              {task.title}
                            </h3>

                            {task.description && (
                              <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                                {task.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {task.estimatedMinutes} menit
                              </span>

                              {totalSteps > 0 && (
                                <span className={`px-2 py-0.5 rounded-full font-semibold ${isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                  {isDone ? 'Selesai' : `${completedSteps}/${totalSteps} bagian`}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Slide-out Drawer for Micro-Tasks detail */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col p-6 relative overflow-y-auto animate-slideLeft">
            
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 p-2 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1 block">
                Detail Tugas ({selectedTask.category})
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
                {selectedTask.title}
              </h2>
              {selectedTask.description && (
                <p className="text-sm text-slate-500 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                  "{selectedTask.description}"
                </p>
              )}
            </div>

            {/* Task Controls */}
            <div className="flex gap-2 mb-6">
              {selectedTask.status !== 'COMPLETED' ? (
                <button
                  onClick={() => updateTaskStatusMutation.mutate({ id: selectedTask.id, status: 'COMPLETED' })}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Selesaikan Tugas
                </button>
              ) : (
                <button
                  onClick={() => updateTaskStatusMutation.mutate({ id: selectedTask.id, status: 'PENDING' })}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Circle className="w-4 h-4" />
                  Kembalikan ke Pending
                </button>
              )}

              <button
                onClick={() => {
                  if (confirm('Yakin ingin menghapus tugas ini?')) {
                    deleteTaskMutation.mutate(selectedTask.id);
                  }
                }}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2.5 rounded-xl border border-rose-100 transition"
                title="Hapus Tugas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Micro-Tasks Breakdown */}
            <div className="flex-1">
              <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Langkah Kecil yang Disiapkan AI:
              </h3>

              {selectedTask.microTasks.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-8 border border-dashed border-slate-200 rounded-xl">
                  Tidak ada langkah kecil otomatis.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedTask.microTasks.map((step) => {
                    return (
                      <div
                        key={step.id}
                        onClick={() => toggleMicrotaskMutation.mutate({ id: step.id, completed: !step.completed })}
                        className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                          step.completed
                            ? 'bg-emerald-50/50 border-emerald-100 text-slate-400 line-through'
                            : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700'
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                        )}
                        <span className="text-xs leading-relaxed font-medium">
                          {step.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Microtask progress */}
            {selectedTask.microTasks.length > 0 && (
              <div className="border-t border-slate-100 pt-4 mt-6">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2">
                  <span>Progres Langkah</span>
                  <span>
                    {selectedTask.microTasks.filter(m => m.completed).length} dari {selectedTask.microTasks.length} selesai
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{
                      width: `${
                        (selectedTask.microTasks.filter(m => m.completed).length / selectedTask.microTasks.length) * 100
                      }%`
                    }}
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 text-center py-6 text-xs border-t border-slate-900 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>11th-Grade War Room - Dibuat spesial untuk membantu kamu belajar dengan tenang ☕</span>
          <span>Semangat kelas 11-nya! Jangan lupa bahagia.</span>
        </div>
      </footer>
    </div>
  );
}
