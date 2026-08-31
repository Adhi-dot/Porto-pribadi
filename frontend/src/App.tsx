import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Sparkles, BookOpen, Trophy, GraduationCap,
  Coffee, CheckCircle2, Circle, Clock, Trash2,
  RefreshCw, ChevronDown, ChevronUp, Heart, Star, Smile, Flower2
} from 'lucide-react';

interface MicroTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'SCHOOL' | 'COMPETITION' | 'TUTORING' | 'PERSONAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  estimatedMinutes: number;
  microTasks: MicroTask[];
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [brainDumpText, setBrainDumpText] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Gagal mengambil tugas:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle Brain Dump submission
  const handleBrainDump = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brainDumpText.trim()) return;

    setLoadingAI(true);
    setAiMessage(null);
    try {
      const res = await axios.post('/api/ai/brain-dump', { text: brainDumpText });
      setAiMessage(res.data.message);
      setBrainDumpText('');
      fetchTasks();
    } catch (err) {
      console.error('Gagal memproses brain dump:', err);
      alert('Duh, gagal nulis unek-uneknya sayang. Coba lagi ya! 🥺');
    } finally {
      setLoadingAI(false);
    }
  };

  // Toggle MicroTask
  const toggleMicroTask = async (microId: string, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/tasks/microtasks/${microId}`, { completed: !currentStatus });
      fetchTasks();
    } catch (err) {
      console.error('Gagal update microtask:', err);
    }
  };

  // Update Task Status
  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`/api/tasks/${id}`, { status });
      fetchTasks();
    } catch (err) {
      console.error('Gagal update status:', err);
    }
  };

  // Delete Task
  const deleteTask = async (id: string) => {
    if (!confirm('Yakin mau hapus tugas ini? 🌸')) return;
    try {
      await axios.delete(`/api/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error('Gagal hapus tugas:', err);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'SCHOOL': return <BookOpen className="w-4 h-4 text-pink-500" />;
      case 'COMPETITION': return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'TUTORING': return <GraduationCap className="w-4 h-4 text-purple-500" />;
      case 'PERSONAL': return <Coffee className="w-4 h-4 text-emerald-500" />;
      default: return <BookOpen className="w-4 h-4 text-pink-500" />;
    }
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'URGENT': return <span className="px-2.5 py-1 text-xs font-semibold bg-rose-100 text-rose-600 rounded-full border border-rose-200 shadow-sm">🔥 Urgent Banget</span>;
      case 'HIGH': return <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full border border-amber-200 shadow-sm">⚡ Penting</span>;
      case 'MEDIUM': return <span className="px-2.5 py-1 text-xs font-semibold bg-sky-100 text-sky-700 rounded-full border border-sky-200 shadow-sm">💖 Normal</span>;
      case 'LOW': return <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-600 rounded-full border border-purple-200 shadow-sm">☁️ Santai</span>;
      default: return null;
    }
  };

  const filteredTasks = filter === 'ALL' ? tasks : tasks.filter(t => t.category === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 text-slate-800 flex flex-col font-sans selection:bg-pink-200">
      {/* Decorative Floating Sparkles & Bubbles */}
      <div className="absolute top-10 left-10 text-pink-300 animate-pulse pointer-events-none hidden md:block">✨</div>
      <div className="absolute top-32 right-16 text-purple-300 animate-bounce pointer-events-none hidden md:block">🌸</div>
      <div className="absolute bottom-20 left-20 text-rose-300 animate-pulse pointer-events-none hidden md:block">🎀</div>

      {/* Navbar */}
      <header className="border-b border-pink-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-pink-400 to-purple-400 p-2.5 rounded-2xl text-white shadow-md shadow-pink-300/40 transform hover:rotate-6 transition">
              <Flower2 className="w-6 h-6 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
                11th-Grade Cute War Room 🎀
              </h1>
              <p className="text-xs text-pink-600/80 font-medium">Anti-Burnout Study Buddy & Sanity Co-Pilot ✨</p>
            </div>
          </div>
          <div className="text-xs bg-pink-100 text-pink-600 px-3.5 py-1.5 rounded-full border border-pink-200 font-medium shadow-sm hidden sm:flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-pink-500" /> Semangat terus dekk
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full space-y-8">

        {/* Brain Dump Box */}
        <section className="bg-white/80 backdrop-blur-md border border-pink-200/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-pink-100/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6 w-52 h-52 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center space-x-2 mb-3">
            <div className="p-1.5 bg-pink-100 rounded-xl text-pink-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Ceritain Unek-Unek & Jadwal kamu Hari Ini 💌</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Lagi pusing tugas sekolah, deadline lomba, atau capek abis les? Tulis aja semuanya di bawah ini. AI bakal otomatis beresin dan pecah jadi tugas kecil yang gemes & gampang dicicil! 🧸✨
          </p>

          <form onSubmit={handleBrainDump} className="space-y-4">
            <textarea
              value={brainDumpText}
              onChange={(e) => setBrainDumpText(e.target.value)}
              placeholder="Contoh: Duh besok ada PR fisika susah banget, lusa harus kumpul proposal essay lomba ekonomi, terus nanti sore jam 4 ada les matematika..."
              rows={4}
              className="w-full bg-pink-50/50 border border-pink-200/80 rounded-2xl p-4 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm resize-none shadow-inner"
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-pink-600 font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-pink-400 text-pink-400" /> Tip: Makin detail curhatmu, makin rapi jadwal yang dibikin!
              </span>
              <button
                type="submit"
                disabled={loadingAI || !brainDumpText.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 hover:opacity-95 disabled:opacity-50 text-white px-7 py-3 rounded-2xl text-sm font-semibold transition shadow-lg shadow-pink-400/30 flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-[1.02] active:scale-95"
              >
                {loadingAI ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Lagi disiapin Kakak AI... 🪄</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Atur Jadwal & Tugas</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* AI Motivational Message Banner */}
          {aiMessage && (
            <div className="mt-6 bg-gradient-to-r from-pink-100/90 to-purple-100/90 border border-pink-200 rounded-2xl p-4 flex items-start space-x-3 text-slate-700 text-sm animate-fade-in shadow-sm">
              <div className="bg-pink-400 p-2 rounded-xl text-white shadow-sm mt-0.5">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <div>
                <span className="font-bold text-pink-700 block mb-1">Pesan Cinta dari Kakak Kelas 💌:</span>
                <p className="leading-relaxed text-xs sm:text-sm">{aiMessage}</p>
              </div>
            </div>
          )}
        </section>

        {/* Filters & Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-pink-200/80 pb-4">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
            <span>To-Do List & War Room 🌸</span>
            <span className="text-xs bg-pink-100 text-pink-600 px-2.5 py-1 rounded-full font-bold shadow-sm">
              {filteredTasks.length} Tugas
            </span>
          </h3>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {['ALL', 'SCHOOL', 'COMPETITION', 'TUTORING', 'PERSONAL'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shadow-sm cursor-pointer ${
                  filter === cat
                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-pink-300/50 scale-105'
                    : 'bg-white/80 text-slate-600 hover:bg-pink-50 hover:text-pink-600 border border-pink-100'
                }`}
              >
                {cat === 'ALL' ? '🌟 Semua' : cat === 'SCHOOL' ? '📚 Sekolah' : cat === 'COMPETITION' ? '🏆 Lomba' : cat === 'TUTORING' ? '🎓 Les' : '☕ Personal'}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white/60 backdrop-blur-md border border-pink-200/60 rounded-3xl shadow-sm">
            <Coffee className="w-12 h-12 text-pink-300 mx-auto mb-3 animate-bounce" />
            <h4 className="text-slate-700 font-bold text-base">Bersih banget! Belum ada tugas ☁️</h4>
            <p className="text-xs text-slate-400 mt-1">Waktunya nikmati boba atau me time sebentar! 🧋✨</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTasks.map((task) => {
              const isExpanded = expandedTaskId === task.id;
              const completedMicroCount = task.microTasks.filter(m => m.completed).length;
              const totalMicro = task.microTasks.length;
              const progressPercent = totalMicro > 0 ? Math.round((completedMicroCount / totalMicro) * 100) : 0;

              return (
                <div
                  key={task.id}
                  className="bg-white/90 backdrop-blur-md border border-pink-200/70 rounded-3xl p-6 hover:border-pink-300 transition-all duration-300 flex flex-col justify-between shadow-lg shadow-pink-100/40 hover:shadow-xl group"
                >
                  <div>
                    {/* Top Meta */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-pink-50 p-2 rounded-2xl border border-pink-100 shadow-sm">
                          {getCategoryIcon(task.category)}
                        </span>
                        <span className="text-xs font-bold text-slate-500 tracking-wider">
                          {task.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(task.priority)}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h4 className="font-bold text-slate-800 text-base mb-1.5 group-hover:text-pink-600 transition">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
                    )}

                    {/* Time & Microtask Progress */}
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-3 bg-pink-50/60 px-3.5 py-2.5 rounded-2xl border border-pink-100">
                      <div className="flex items-center space-x-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-pink-400" />
                        <span>Est: {task.estimatedMinutes} menit</span>
                      </div>
                      <div className="text-pink-600 font-bold">
                        {completedMicroCount}/{totalMicro} Steps ({progressPercent}%)
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-pink-100 h-2 rounded-full overflow-hidden mb-4 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-pink-400 to-purple-400 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* MicroTasks Accordion */}
                  <div>
                    {task.microTasks.length > 0 && (
                      <button
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-pink-600 bg-pink-50 hover:bg-pink-100/70 border border-pink-200 px-3.5 py-2.5 rounded-2xl transition mb-3 shadow-sm cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          🌸 {isExpanded ? 'Tutup Micro-Tasks' : 'Lihat Micro-Tasks (Biar Gak Pusing)'}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}

                    {isExpanded && (
                      <div className="space-y-2 mb-4 bg-pink-50/80 p-3.5 rounded-2xl border border-pink-200/60 animate-fade-in shadow-inner">
                        <p className="text-[11px] text-pink-700 font-bold mb-2 flex items-center gap-1">
                          🧸 Cicil pelan-pelan ya cantik (15-30 min steps):
                        </p>
                        {task.microTasks.map((micro) => (
                          <div
                            key={micro.id}
                            onClick={() => toggleMicroTask(micro.id, micro.completed)}
                            className="flex items-center space-x-2.5 text-xs cursor-pointer hover:bg-white/80 p-2 rounded-xl transition text-slate-700 shadow-sm"
                          >
                            {micro.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-pink-300 shrink-0" />
                            )}
                            <span className={micro.completed ? 'line-through text-slate-400 font-normal' : 'font-medium'}>
                              {micro.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-pink-100 text-xs">
                      <select
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                        className="bg-white border border-pink-200 text-slate-700 font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs shadow-sm cursor-pointer"
                      >
                        <option value="PENDING">Belum Mulai ⏳</option>
                        <option value="IN_PROGRESS">Lagi Dikerjain 🚀</option>
                        <option value="COMPLETED">Selesai 🎉</option>
                      </select>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-slate-400 hover:text-rose-500 p-2 transition rounded-xl hover:bg-rose-50 cursor-pointer"
                        title="Hapus Tugas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-pink-200/80 py-6 text-center text-xs text-pink-600/80 mt-12 bg-white/40 backdrop-blur-sm">
        <p className="flex items-center justify-center gap-1 font-medium">
          The 11th-Grade War Room
        </p>
      </footer>
    </div>
  );
}
