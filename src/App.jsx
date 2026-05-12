import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  History as HistoryIcon, 
  X as XIcon, 
  ChevronRight, 
  Zap, 
  Target as TargetIcon, 
  Book, 
  Droplets, 
  Dumbbell, 
  Utensils, 
  Ban, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Layout as LayoutIcon, 
  User as UserIcon, 
  Settings as SettingsIcon,
  Award, 
  TrendingUp, 
  Edit3, 
  Eye, 
  EyeOff, 
  Shield,
  Check, 
  ArrowLeft, 
  Menu as MenuIcon, 
  ChevronLeft,
  Mic, 
  Keyboard, 
  Square, 
  Mail, 
  Clock, 
  ExternalLink, 
  RotateCcw, 
  Plus, 
  Home as HomeIcon,
  LayoutGrid as LayoutGridIcon,
  FileText, 
  Upload, 
  Compass, 
  Anchor, 
  RefreshCw, 
  BarChart3, 
  ListChecks,
  LogOut, 
  Image as ImageIcon, 
  XCircle, 
  PlayCircle,
  Lock as LockIcon
} from 'lucide-react';
import { supabase } from './supabase';

// --- UTILIDADES Y CONFIGURACIÓN ---
const generateShortId = () => Math.random().toString(36).substr(2, 6).toUpperCase();

// Generador de ciclo con estructura BCLA
const createNewCycle = (strategyConfig = [], habitsConfig = []) => ({
  id: Date.now(),
  status: 'active',
  label: `MATRIZ 2026`,
  days: Array(92).fill(null).map((_, i) => ({
    id: i + 1,
    status: 'pending',
    bcla: {
      bcla_check: false,
      t1: { name: '', done: false },
      t2: { name: '', done: false },
      t3: { name: '', done: false },
    },
    iron: (habitsConfig || []).reduce((acc, h) => ({ ...acc, [h.id]: false }), {}), 
    notes: '',
    image: null,
    strategySnapshot: null,
    habitsSnapshot: null,
  })),
  currentDay: 1,
  lastCheck: new Date().toISOString()
});

// --- DATOS DE EJEMPLO ---
const INITIAL_STRATEGY = [
  { id: 's_bhag', name: 'LIBERTAD OPERATIVA: $20K/MES NETO', active: true },
  { id: 's_q1', name: 'ESTANDARIZAR PRODUCTO VIP', active: true },
  { id: 's_q2', name: 'SISTEMA DE ADQUISICIÓN SKOOL', active: true }
];

const INITIAL_HABITS = [
  { id: 'h_1', name: '45m Movimiento (Trinchera)', active: true },
  { id: 'h_2', name: 'Lectura 10p (Crecimiento)', active: true },
  { id: 'h_3', name: 'Métrica Diaria en Skool', active: true }
];

const MOCK_HISTORY = [
  {
    id: 1715100000000,
    status: 'paused',
    label: 'SPRINT Q4 - 2025',
    completedDays: 45,
    endDate: new Date(2025, 11, 20).toISOString(),
    days: Array(92).fill(null).map((_, i) => ({
      id: i + 1,
      status: i < 45 ? 'completed' : 'pending'
    }))
  },
  {
    id: 1712100000000,
    status: 'completed',
    label: 'CIMIENTO BCLA',
    completedDays: 92,
    endDate: new Date(2025, 8, 15).toISOString(),
    days: Array(92).fill(null).map((_, i) => ({
      id: i + 1,
      status: 'completed'
    }))
  }
];

// --- COMPONENTES UI BASE ---

const AppContainer = ({ children }) => (
  <div className="min-h-screen bg-[#000000] flex justify-center font-sans overflow-x-hidden selection:bg-[#FACC15] selection:text-black">
    <div className="w-full max-w-[450px] min-h-screen bg-black flex flex-col relative border-x border-zinc-900 shadow-2xl">
      {children}
    </div>
  </div>
);

const CustomConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl space-y-6 text-center">
        <AlertTriangle size={48} className="mx-auto text-[#FACC15]" />
        <div className="space-y-2 text-white">
          <h3 className="text-lg font-black uppercase italic tracking-tighter">¿Confirmar Acción?</h3>
          <p className="text-[11px] text-zinc-500 uppercase font-bold tracking-widest leading-relaxed px-4">{String(message)}</p>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl uppercase text-[10px] tracking-widest transition-all">Confirmar</button>
          <button onClick={onCancel} className="w-full bg-zinc-800 text-zinc-400 font-black py-4 rounded-xl uppercase text-[10px] tracking-widest transition-all">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

const MessageBanner = ({ errorMessage }) => {
  if (!errorMessage) return null;
  return (
    <div className="fixed top-28 left-1/2 -translate-x-1/2 w-[90%] max-w-xs bg-red-600 text-white p-4 rounded-xl z-[100] shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 border-2 border-white/20">
      <AlertTriangle size={20} className="shrink-0" />
      <p className="text-[10px] font-black uppercase tracking-tight leading-tight">{String(errorMessage)}</p>
    </div>
  );
};

// --- VISTAS Y OVERLAYS ---

const SettingsOverlay = ({ 
  user, setUser, setShowSettings, avatarInputRef, requestAction,
  toggleAllHabits, toggleAllStrategy, addNewHabit, removeHabit, onLogout
}) => {
  const allStrategyOn = (user.strategyConfig || []).every(s => s.active);
  const allHabitsOn = (user.habitsConfig || []).every(h => h.active);
  const canAddHabit = (user.habitsConfig || []).length < 5;

  return (
    <div className="fixed inset-0 bg-black z-[150] overflow-y-auto animate-in slide-in-from-bottom duration-300 no-scrollbar">
      <div className="max-w-[450px] mx-auto p-6 pb-40">
        <header className="flex justify-between items-center mb-10 sticky top-0 bg-black/90 backdrop-blur-md py-4 z-10 text-white">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Ajustes</h2>
          <button onClick={() => setShowSettings(false)} className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-400 border border-zinc-800">
            <XIcon size={24} />
          </button>
        </header>

        <div className="space-y-10">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 text-center relative shadow-2xl">
            <div className="w-28 h-28 rounded-2xl bg-zinc-800 mx-auto border-4 border-[#FACC15] relative overflow-hidden mb-6">
              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" /> : <UserIcon className="m-8 text-zinc-600 w-12 h-12" />}
              <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><Camera size={24} className="text-white" /></button>
            </div>
            <input type="text" value={String(user.name)} onChange={(e) => setUser({...user, name: e.target.value.toUpperCase()})} className="bg-transparent border-none text-white text-2xl font-black italic uppercase tracking-tighter text-center w-full outline-none" />
            <div className="flex justify-center mt-4">
              <span className="text-[10px] text-[#FACC15] font-black tracking-widest uppercase bg-[#FACC15]/10 px-4 py-1 rounded-full">ID: {String(user.idTag)}</span>
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h4 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Estrategia BCLA</h4>
              <button onClick={toggleAllStrategy} className="text-[8px] font-black uppercase text-[#FACC15] px-3 py-1 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-all">{allStrategyOn ? "OFF ALL" : "ON ALL"}</button>
            </div>
            <div className="space-y-3">
              {(user.strategyConfig || []).map((s, i) => (
                <div key={s.id} className={`bg-zinc-900/20 border p-5 rounded-2xl flex items-center gap-4 transition-all ${s.active ? 'border-zinc-800 shadow-xl' : 'border-zinc-900 opacity-30'}`}>
                  <button onClick={() => { const ns = [...user.strategyConfig]; ns[i].active = !ns[i].active; setUser({...user, strategyConfig: ns}); }} className={`w-12 h-6 rounded-full relative transition-all ${s.active ? 'bg-[#FACC15]' : 'bg-zinc-800'}`}><div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${s.active ? 'left-7 bg-black' : 'left-1 bg-zinc-500'}`} /></button>
                  <div className="flex-1 overflow-hidden">
                     <p className="text-[8px] font-black text-[#FACC15] uppercase mb-0.5">{String(s.id).includes('bhag') ? 'BHAG' : 'META Q'}</p>
                     <input type="text" value={String(s.name)} onChange={(e) => { const ns = [...user.strategyConfig]; ns[i].name = e.target.value; setUser({...user, strategyConfig: ns}); }} className="bg-transparent text-white font-bold text-sm uppercase outline-none w-full truncate italic" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-2">
                <h4 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Hábitos y disciplinas</h4>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${!canAddHabit ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-500'}`}>
                  {String(user.habitsConfig.length)}/5
                </span>
              </div>
              <button onClick={toggleAllHabits} className="text-[8px] font-black uppercase text-[#FACC15] px-3 py-1 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-all">
                {allHabitsOn ? "OFF ALL" : "ON ALL"}
              </button>
            </div>
            <div className="space-y-3">
              {(user.habitsConfig || []).map((h, i) => (
                <div key={h.id} className={`bg-zinc-900/20 border p-5 rounded-2xl flex items-center justify-between gap-4 transition-all ${h.active ? 'border-zinc-800 shadow-xl' : 'border-zinc-900 opacity-40'}`}>
                  <div className="flex items-center gap-4 flex-1">
                    <button onClick={() => { const nc = [...user.habitsConfig]; nc[i].active = !nc[i].active; setUser({...user, habitsConfig: nc}); }} className={`w-12 h-6 rounded-full relative transition-all ${h.active ? 'bg-[#FACC15]' : 'bg-zinc-800'}`}><div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${h.active ? 'left-7 bg-black' : 'left-1 bg-zinc-500'}`} /></button>
                    <input type="text" value={String(h.name)} onChange={(e) => { const nc = [...user.habitsConfig]; nc[i].name = e.target.value; setUser({...user, habitsConfig: nc}); }} className="bg-transparent font-bold text-sm outline-none w-full text-white" />
                  </div>
                  <button onClick={() => removeHabit(h.id)} className="text-zinc-700 hover:text-red-500 transition-colors p-1"><XIcon size={18} /></button>
                </div>
              ))}
              <button 
                onClick={addNewHabit} 
                disabled={!canAddHabit}
                className={`w-full p-5 border-2 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${canAddHabit ? 'border-dashed border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400 shadow-inner' : 'border-solid border-zinc-900 bg-zinc-900/20 text-zinc-800 cursor-not-allowed'}`}
              >
                {canAddHabit ? <><Plus size={14} /> Añadir Habilidad</> : <><Ban size={14} /> Límite Alcanzado</>}
              </button>
            </div>
          </section>

          <section className="pt-6 space-y-4">
            <h4 className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.3em] px-2">Gestión de Datos</h4>
            <div className="grid gap-3">
              <button onClick={() => requestAction("¿Deseas iniciar un nuevo ciclo desde cero?", "pauseAndNew")} className="w-full p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center gap-4 text-zinc-400 font-bold uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all shadow-xl">
                  <Plus size={18} className="text-[#FACC15]" /> Nuevo Ciclo 92D
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button onClick={onLogout} className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center gap-3 text-zinc-400 font-bold uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all">
                    <LogOut size={16} className="text-red-500" /> Salir
                </button>
                <button onClick={() => requestAction("¿ELIMINAR TODO EL HISTORIAL? Esta acción no se puede deshacer.", "deleteAccount")} className="p-5 bg-red-950/10 border border-red-900/20 rounded-2xl flex items-center justify-center gap-3 text-red-600 font-bold uppercase text-[10px] tracking-widest hover:bg-red-900/10 transition-all">
                    <Trash2 size={16} /> Borrar Todo
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const AttemptsCarousel = ({ currentCycle, historyList, onOpenHistory, onOpenHistoricalMatrix, onOpenCurrentDay }) => (
  <div className="mb-10 text-white">
    <div className="flex justify-between items-center mb-5 px-1">
        <h4 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest italic">Línea de Tiempo</h4>
        <button onClick={onOpenHistory} className="text-[10px] font-black text-[#FACC15] uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">Historial <ChevronRight size={12} /></button>
    </div>
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory px-1">
      <div 
        onClick={onOpenCurrentDay} 
        className="snap-start flex-shrink-0 w-40 aspect-[3/4] bg-[#FACC15] p-5 rounded-3xl relative overflow-hidden group cursor-pointer active:scale-95 transition-all shadow-xl border-4 border-white/5"
      >
        <TrendingUp size={24} className="absolute top-5 right-5 text-black opacity-20" />
        <div className="bg-black text-[#FACC15] px-2.5 py-1 rounded-full absolute top-5 left-5 flex items-center gap-1.5 shadow-lg">
          <span className="w-1.5 h-1.5 bg-[#FACC15] rounded-full animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-tighter italic">Live</span>
        </div>
        <div className="absolute bottom-6 left-5 right-5">
          <p className="text-3xl font-black italic text-black leading-none mb-1 tracking-tighter">D{String(currentCycle.currentDay)}</p>
          <p className="text-[9px] text-black/50 font-black uppercase">{String(currentCycle.label)}</p>
          <div className="mt-4 h-1 bg-black/20 rounded-full overflow-hidden">
            <div className="h-full bg-black" style={{ width: `${(currentCycle.currentDay/92)*100}%` }}></div>
          </div>
        </div>
      </div>

      {(historyList || []).map((item, idx) => (
         <div key={item.id || idx} onClick={() => onOpenHistoricalMatrix(item)} className="snap-start flex-shrink-0 w-40 aspect-[3/4] bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl hover:border-zinc-600 cursor-pointer relative transition-all group shadow-lg">
            <div className={`px-2.5 py-1 rounded-full absolute top-5 left-5 ${item.status === 'paused' ? 'bg-zinc-800 text-[#FACC15]' : 'bg-zinc-800 text-zinc-500'}`}>
              <span className="text-[8px] font-black uppercase tracking-widest italic">{String(item.status === 'paused' ? 'Pausado' : 'Sellado')}</span>
            </div>
            <div className="absolute bottom-6 left-5 right-5">
              <p className="text-2xl font-black italic text-zinc-300 leading-none mb-1 tracking-tighter">{String(item.completedDays || 0)}/92</p>
              <p className="text-[8px] text-zinc-600 font-bold uppercase">{String(item.label)}</p>
              <div className="mt-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full ${item.status === 'paused' ? 'bg-[#FACC15]/40' : 'bg-zinc-600'}`} style={{ width: `${((item.completedDays || 0)/92)*100}%` }}></div>
              </div>
            </div>
         </div>
      ))}
    </div>
  </div>
);

const ExecutionView = ({ 
  dayId, cycle, setCurrentCycle, user, handleCompleteDay, isHistorical = false, isRecordingGlobal
}) => {
  const day = cycle?.days?.find(d => d.id === dayId);
  const isLocked = isHistorical || day?.status === 'completed' || dayId < cycle?.currentDay;
  const [tasks, setTasks] = useState(day?.bcla || {});
  const [iron, setIron] = useState(day?.iron || {});
  const [notes, setNotes] = useState(day?.notes || '');
  const [dayImage, setDayImage] = useState(day?.image || null);
  const dailyImageInputRef = useRef(null);

  useEffect(() => {
    if (isHistorical || !cycle) return;
    const updated = cycle.days.map(d => d.id === dayId ? {...d, bcla: tasks, iron: iron, notes: notes, image: dayImage} : d);
    if (JSON.stringify(updated) !== JSON.stringify(cycle.days)) {
        setCurrentCycle({...cycle, days: updated});
    }
  }, [tasks, iron, notes, dayImage, dayId, cycle, isHistorical, setCurrentCycle]);

  if (!day) return null;

  const displayStrategy = day.status === 'completed' && day.strategySnapshot 
    ? day.strategySnapshot 
    : (user?.strategyConfig || []).filter(s => s.active) || [];

  const displayHabits = day.status === 'completed' && day.habitsSnapshot
    ? day.habitsSnapshot
    : (user?.habitsConfig || []).filter(h => h.active) || [];

  return (
    <div className="animate-in fade-in duration-500 pb-40 text-white">
      <header className="mb-12 text-center flex flex-col items-center pt-6">
        <div className={`font-black w-20 h-20 rounded-2xl flex items-center justify-center italic text-4xl mb-4 shadow-xl ${isLocked ? 'bg-zinc-900 text-zinc-600' : 'bg-[#FACC15] text-black shadow-[#FACC15]/20'}`}>
          {String(day.id)}
        </div>
        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">Bitácora_Hoy</h2>
        <p className="text-[9px] text-zinc-600 uppercase tracking-[0.3em] font-bold mt-2 italic">{isLocked ? 'Cerrado // Lectura' : 'Protocolo Activo'}</p>
      </header>

      <div className="space-y-12">
        {displayStrategy.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-1 text-zinc-500 italic"><Anchor size={14} className="text-[#FACC15]" /> <h4 className="text-[10px] font-black uppercase tracking-widest">Norte Estratégico</h4></div>
            <div className="grid gap-3">
              {displayStrategy.map(s => (
                <div key={s.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#FACC15]/20" />
                  <p className="text-[8px] font-black text-[#FACC15] uppercase mb-1">{String(s.id).includes('bhag') ? 'BHAG' : 'META Q'}</p>
                  <p className="text-sm font-bold text-white uppercase italic tracking-tight leading-none">{String(s.name)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex items-center gap-3 px-1 text-zinc-500 italic"><Compass size={14} className="text-[#FACC15]" /> <h4 className="text-[10px] font-black uppercase tracking-widest">BCLA Protocol</h4></div>
          <div 
            onClick={() => !isLocked && setTasks({...tasks, bcla_check: !tasks.bcla_check})} 
            className={`p-7 rounded-3xl border-2 transition-all cursor-pointer ${tasks.bcla_check ? 'bg-[#FACC15] border-[#FACC15] text-black shadow-xl' : 'bg-zinc-900/50 border-zinc-800'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${tasks.bcla_check ? 'bg-black text-[#FACC15] border-black' : 'border-zinc-700'}`}>
                {tasks.bcla_check && <Check size={18} className="stroke-[3]" />}
              </div>
              <div>
                <p className={`font-black text-lg uppercase italic tracking-tighter leading-none ${tasks.bcla_check ? 'text-black' : 'text-white'}`}>Check-in Skool</p>
                <p className={`text-[9px] uppercase font-bold tracking-widest mt-1 ${tasks.bcla_check ? 'text-black/50' : 'text-zinc-600'}`}>Post Diario_ACTIVO</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map(num => (
              <div key={num} className="flex items-center gap-4 p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl transition-all focus-within:border-[#FACC15]">
                <input type="checkbox" checked={tasks[`t${num}`]?.done} disabled={isLocked} onChange={(e) => setTasks({...tasks, [`t${num}`]: {...tasks[`t${num}`], done: e.target.checked}})} className="w-6 h-6 accent-[#FACC15] rounded-xl cursor-pointer" />
                <input type="text" placeholder={`Acción Crítica ${num}...`} value={tasks[`t${num}`]?.name} disabled={isLocked} onChange={(e) => setTasks({...tasks, [`t${num}`]: {...tasks[`t${num}`], name: e.target.value}})} className="bg-transparent text-sm w-full outline-none text-white font-bold placeholder:text-zinc-800 italic" />
              </div>
            ))}
          </div>
        </section>

        {displayHabits.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-1 text-zinc-500 italic"><Shield size={14} className="text-[#FACC15]" /> <h4 className="text-[10px] font-black uppercase tracking-widest">Disciplinas de Ejecución</h4></div>
            <div className="grid grid-cols-2 gap-3">
              {displayHabits.map(h => (
                <button 
                  key={h.id} 
                  disabled={isLocked} 
                  onClick={() => setIron({...iron, [h.id]: !iron[h.id]})} 
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-[10px] font-black uppercase italic ${iron[h.id] ? 'bg-[#FACC15] border-[#FACC15] text-black shadow-lg' : 'bg-zinc-900/50 border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}
                >
                  <Zap size={14} className={iron[h.id] ? 'fill-black' : ''} /> {String(h.name)}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest px-1">Lección de la Trinchera</h4>
            <textarea 
              placeholder="¿Qué aprendiste hoy?" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              disabled={isLocked} 
              className={`w-full h-32 bg-zinc-900 border-2 rounded-2xl p-6 text-sm text-zinc-200 outline-none resize-none font-bold placeholder:text-zinc-800 transition-all ${isRecordingGlobal ? 'border-[#FACC15] shadow-lg animate-pulse' : 'border-zinc-800 focus:border-zinc-700'}`} 
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest px-1">Evidencia Visual</h4>
            <div onClick={() => !isLocked && dailyImageInputRef.current?.click()} className={`w-full aspect-video rounded-3xl border-4 border-dashed overflow-hidden relative group cursor-pointer transition-all ${isLocked ? 'border-zinc-900 bg-zinc-900/20' : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/40'}`}>
              {dayImage ? (
                 <img src={dayImage} className="w-full h-full object-cover" alt="Evidencia" />
              ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-800">
                    <ImageIcon size={40} className="opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">{isLocked ? 'SIN REGISTRO' : 'CARGAR'}</p>
                 </div>
              )}
            </div>
            <input type="file" accept="image/*" ref={dailyImageInputRef} className="hidden" onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setDayImage(reader.result); reader.readAsDataURL(file); } }} />
          </div>
        </section>

        {!isLocked && (
          <button onClick={() => handleCompleteDay(day.id)} className="w-full bg-[#FACC15] text-black font-black py-6 rounded-2xl uppercase text-lg italic tracking-tight active:scale-95 transition-all shadow-xl shadow-[#FACC15]/10 border-4 border-white/10">
            Sellar_Jornada
          </button>
        )}
      </div>
    </div>
  );
};

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  return (
    <div className="flex-1 flex flex-col p-8 pt-20 animate-in fade-in duration-700 justify-center">
      {/* Grupo de Marca */}
      <div className="mb-12 text-center">
        <div className="w-16 h-16 bg-[#FACC15] rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-[0_0_40px_rgba(250,204,21,0.2)]">
          <Zap size={32} fill="black" />
        </div>
        <h1 className="text-5xl font-black text-white italic leading-none mb-3 tracking-tighter">
          FOCUS
        </h1>
        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
          Infraestructura de Ejecución BCLA
        </p>
      </div>

      {/* Formulario e Interacción */}
      <div className="space-y-8 w-full">
        <div className="space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="email" 
              placeholder="ID Operador"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-5 pl-14 pr-6 text-white outline-none focus:border-[#FACC15] transition-all font-bold placeholder:text-zinc-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <LockIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-5 pl-14 pr-6 text-white outline-none focus:border-[#FACC15] transition-all font-bold placeholder:text-zinc-800"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <button onClick={onLogin} className="w-full bg-[#FACC15] text-black font-black py-6 rounded-2xl uppercase text-lg italic tracking-tight active:scale-95 transition-all shadow-lg shadow-[#FACC15]/5 border-2 border-white/5">
            INICIAR BITÁCORA
          </button>
          <button className="w-full text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:text-zinc-400">
            ¿Problemas con el acceso?
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  // --- AUTH STATE ---
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setAuthError(null);
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) throw error;
        alert('Registro exitoso. Por favor verifica tu correo para activar tu cuenta.');
        setAuthMode('login');
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const loadingView = (
    <div style={{minHeight:'100vh',background:'#000',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'1rem'}}>
      <p style={{color:'#FACC15',fontFamily:'sans-serif',fontSize:'12px',letterSpacing:'0.3em'}}>CARGANDO...</p>
    </div>
  );

  const authView = (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem'}}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        <div style={{marginBottom:'2.5rem',textAlign:'center'}}>
          <div style={{width:'64px',height:'64px',background:'#FACC15',borderRadius:'16px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'900',fontSize:'2rem',fontStyle:'italic',color:'#000',margin:'0 auto 1.5rem'}}>F</div>
          <h1 style={{color:'#fff',fontFamily:'sans-serif',fontWeight:'900',fontSize:'2.5rem',fontStyle:'italic',letterSpacing:'-0.05em',margin:0,textTransform:'uppercase'}}>{authMode === 'login' ? 'ACCESO' : 'REGISTRO'}</h1>
          <p style={{color:'#52525b',fontFamily:'sans-serif',fontSize:'11px',fontWeight:'700',letterSpacing:'0.15em',textTransform:'uppercase',marginTop:'0.5rem'}}>{authMode === 'login' ? 'Sincronización de credenciales' : 'Alta de nuevo operador'}</p>
        </div>
        <form onSubmit={handleAuth} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="Email" required
            style={{background:'#18181b',border:'1px solid #27272a',borderRadius:'12px',padding:'1rem 1.25rem',color:'#fff',fontFamily:'sans-serif',fontSize:'1rem',outline:'none',width:'100%',boxSizing:'border-box'}}/>
          <input type="password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} placeholder="Contraseña" required
            style={{background:'#18181b',border:'1px solid #27272a',borderRadius:'12px',padding:'1rem 1.25rem',color:'#fff',fontFamily:'sans-serif',fontSize:'1rem',outline:'none',width:'100%',boxSizing:'border-box'}}/>
          {authError && <p style={{color:'#ef4444',fontFamily:'sans-serif',fontSize:'11px',fontWeight:'700',margin:0}}>{authError}</p>}
          <button type="submit" disabled={authSubmitting}
            style={{background:'#FACC15',color:'#000',border:'none',borderRadius:'12px',padding:'1.25rem',fontFamily:'sans-serif',fontWeight:'900',fontSize:'0.9rem',cursor:'pointer',letterSpacing:'0.1em',textTransform:'uppercase',marginTop:'0.5rem'}}>
            {authSubmitting ? '...' : authMode === 'login' ? 'AUTENTICAR' : 'REGISTRAR'}
          </button>
        </form>
        <button onClick={()=>setAuthMode(authMode==='login'?'signup':'login')}
          style={{marginTop:'1.5rem',background:'none',border:'none',color:'#52525b',fontFamily:'sans-serif',fontSize:'11px',fontWeight:'700',cursor:'pointer',letterSpacing:'0.2em',textTransform:'uppercase',display:'block',width:'100%',textAlign:'center'}}>
          {authMode === 'login' ? '// Crear cuenta de operador' : '// Ya tengo cuenta'}
        </button>
      </div>
    </div>
  );
  // --- END AUTH ---

  const avatarInputRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState('grid'); 
  const [showSettings, setShowSettings] = useState(false);
  const [currentViewingDayId, setCurrentViewingDayId] = useState(null);
  const [selectedHistoryCycle, setSelectedHistoryCycle] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isRecordingGlobal, setIsRecordingGlobal] = useState(false);
  const [confirmState, setConfirmState] = useState({ isOpen: false, message: '', action: null, data: null });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cl_v92_user_v8');
    return saved ? JSON.parse(saved) : {
      name: 'CONSTRUCTOR', 
      motto: 'SKOOL.COM/ FOCUS COMMUNITY', 
      idTag: generateShortId(), 
      avatar: null,
      habitsConfig: INITIAL_HABITS,
      strategyConfig: INITIAL_STRATEGY
    };
  });

  const [currentCycle, setCurrentCycle] = useState(() => {
    const saved = localStorage.getItem('cl_v92_cycle_v8');
    return saved ? JSON.parse(saved) : createNewCycle(user.strategyConfig, user.habitsConfig);
  });

  const [historyList, setHistoryList] = useState(() => {
    const saved = localStorage.getItem('cl_v92_history_v8');
    return saved ? JSON.parse(saved) : MOCK_HISTORY;
  });

  useEffect(() => {
    localStorage.setItem('cl_v92_user_v8', JSON.stringify(user));
    localStorage.setItem('cl_v92_cycle_v8', JSON.stringify(currentCycle));
    localStorage.setItem('cl_v92_history_v8', JSON.stringify(historyList));
  }, [user, currentCycle, historyList]);

  const requestAction = (message, action, data = null) => { setConfirmState({ isOpen: true, message, action, data }); };

  const handleConfirmedAction = () => {
    const { action } = confirmState;
    if (action === "deleteAccount") {
      localStorage.clear();
      window.location.reload();
    } else if (action === "pauseAndNew") {
      const archivedCycle = { 
        ...currentCycle, 
        status: 'paused', 
        label: `${currentCycle.label} (Final)`,
        completedDays: currentCycle.currentDay - 1, 
        endDate: new Date().toISOString() 
      };
      setHistoryList([archivedCycle, ...historyList]);
      setCurrentCycle(createNewCycle(user.strategyConfig, user.habitsConfig));
      setActiveView('grid');
      setShowSettings(false);
    }
    setConfirmState({ ...confirmState, isOpen: false });
  };

  const handleCompleteDay = (dayId) => {
    const day = currentCycle.days.find(d => d.id === dayId);
    if (!day.bcla.bcla_check || !day.bcla.t1.done || !day.bcla.t2.done || !day.bcla.t3.done) {
      setErrorMessage("BLOQUEO: Protocolo BCLA incompleto.");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }
    const updatedDays = currentCycle.days.map(d => d.id === dayId ? { 
      ...d, 
      status: 'completed', 
      strategySnapshot: JSON.parse(JSON.stringify(user.strategyConfig.filter(s => s.active))), 
      habitsSnapshot: JSON.parse(JSON.stringify(user.habitsConfig.filter(h => h.active))) 
    } : d);
    setCurrentCycle(prev => ({ ...prev, days: updatedDays, currentDay: prev.currentDay + 1 }));
    setActiveView('grid');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowSettings(false);
    setActiveView('grid');
  };

  const navItems = [
    { id: 'home', icon: HomeIcon, label: 'Inicio' },
    { id: 'matrix', icon: LayoutGridIcon, label: 'Bitácora' },
    { id: 'goals', icon: TargetIcon, label: 'Metas' },
    { id: 'config', icon: SettingsIcon, label: 'Perfil' },
  ];

  return authLoading ? loadingView : !session ? authView : (
    <AppContainer>
      <MessageBanner errorMessage={errorMessage} />
      <CustomConfirmModal {...confirmState} onConfirm={handleConfirmedAction} onCancel={() => setConfirmState({...confirmState, isOpen: false})} />

      {!isAuthenticated ? (
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <>
          <header className="px-8 py-6 flex justify-between items-end sticky top-0 bg-black/95 backdrop-blur-xl z-50 border-b border-zinc-900/50 h-28">
            <div className="text-white">
              <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                FOCUS
              </h1>
              <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mt-1 italic">Protocolo BCLA_92D</p>
            </div>
            <div className="flex gap-3 pb-1">
              <button onClick={() => setActiveView('history')} className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${activeView === 'history' ? 'bg-[#FACC15] text-black border-[#FACC15]' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>
                <HistoryIcon size={20} />
              </button>
              <button onClick={() => { if (activeView === 'grid') setShowSettings(true); else setActiveView('grid'); }} className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-500 border border-zinc-800 transition-all active:scale-95 shadow-lg">
                {activeView !== 'grid' ? <MenuIcon size={20} /> : <SettingsIcon size={20} />}
              </button>
            </div>
          </header>

          <main className="flex-1 p-8 pb-40 overflow-y-auto no-scrollbar scroll-smooth">
            {activeView === 'grid' && (
              <div className="animate-in fade-in duration-500">
                <div className="mb-12 flex items-center gap-6 bg-zinc-900/20 p-4 rounded-3xl border border-zinc-800/30 shadow-inner">
                    <div className="w-20 h-20 rounded-2xl bg-zinc-900 border-2 border-[#FACC15] flex-shrink-0 overflow-hidden shadow-lg flex items-center justify-center">
                      {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="User" /> : <UserIcon className="text-zinc-700" size={32} />}
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-1 text-white truncate">{String(user.name)}</h2>
                        <p className="text-[9px] text-[#FACC15] font-black uppercase tracking-widest mb-1 italic">Operador Principal</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase truncate">{String(user.motto)}</p>
                    </div>
                </div>

                <AttemptsCarousel 
                  currentCycle={currentCycle} historyList={historyList} 
                  onOpenHistory={() => setActiveView('history')}
                  onOpenHistoricalMatrix={(c) => { setSelectedHistoryCycle(c); setActiveView('historicalGrid'); }}
                  onOpenCurrentDay={() => { setCurrentViewingDayId(currentCycle.currentDay); setActiveView('execution'); }}
                />

                <h4 className="text-[10px] text-zinc-700 font-black uppercase tracking-widest mb-6 px-1 italic text-white">Bitácora de Ejecución 92D</h4>
                <div className="grid grid-cols-7 gap-y-6 gap-x-2 text-center mb-16">
                  {(currentCycle.days || []).map((day) => (
                    <button 
                      key={day.id} 
                      onClick={() => { if (day.id <= currentCycle.currentDay) { setCurrentViewingDayId(day.id); setActiveView('execution'); } }} 
                      disabled={day.id > currentCycle.currentDay} 
                      className={`text-lg font-black italic p-1 transition-all flex flex-col items-center gap-1 ${day.status === 'completed' ? 'text-[#FACC15]' : day.id === currentCycle.currentDay ? 'text-white scale-125' : 'text-zinc-800'}`}
                    >
                      {String(day.id)}
                      {day.id === currentCycle.currentDay && <div className="w-1 h-1 bg-[#FACC15] rounded-full animate-pulse mt-1" />}
                    </button>
                  ))}
                </div>

                <button onClick={() => { setCurrentViewingDayId(currentCycle.currentDay); setActiveView('execution'); }} className="w-full bg-[#FACC15] text-black font-black py-8 rounded-3xl uppercase text-lg italic tracking-tight shadow-xl shadow-[#FACC15]/10 border-4 border-white/10 flex items-center justify-center gap-3">
                    <Zap size={24} fill="black" /> VOLVER A LA ACCIÓN
                </button>
              </div>
            )}

            {activeView === 'execution' && (
              <ExecutionView 
                dayId={currentViewingDayId || currentCycle.currentDay} cycle={currentCycle} 
                setCurrentCycle={setCurrentCycle} user={user} handleCompleteDay={handleCompleteDay}
                isRecordingGlobal={isRecordingGlobal}
              />
            )}

            {activeView === 'history' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <header className="flex items-center gap-4 mb-6">
                  <button onClick={() => setActiveView('grid')} className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500 border border-zinc-800"><ChevronLeft size={20} /></button>
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Ciclos</h2>
                </header>
                <div className="grid gap-4">
                    <div onClick={() => setActiveView('grid')} className="p-8 bg-[#FACC15] rounded-3xl flex justify-between items-center group cursor-pointer shadow-xl">
                        <div>
                          <p className="text-black text-xl font-black uppercase italic leading-none mb-1">Ciclo en Curso</p>
                          <p className="text-[10px] text-black/60 font-black uppercase tracking-widest">Día {String(currentCycle.currentDay)} / 92</p>
                        </div>
                        <ChevronRight size={24} className="text-black" />
                    </div>
                    {(historyList || []).map(v => (
                      <div key={v.id} onClick={() => { setSelectedHistoryCycle(v); setActiveView('historicalGrid'); }} className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl flex justify-between items-center group cursor-pointer hover:bg-zinc-900 transition-all shadow-md">
                        <div>
                          <p className="text-white text-xl font-black uppercase italic leading-none mb-1">{String(v.label)}</p>
                          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{new Date(v.endDate).toLocaleDateString()}</p>
                        </div>
                        <HistoryIcon size={20} className="text-zinc-700" />
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            {activeView === 'historicalGrid' && selectedHistoryCycle && (
              <div className="animate-in fade-in duration-500">
                <header className="flex items-center gap-4 mb-10 text-white">
                    <button onClick={() => setActiveView('history')} className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500 border border-zinc-800 transition-all"><ChevronLeft size={20} /></button>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Resultados</h2>
                </header>
                <div className="grid grid-cols-7 gap-y-6 gap-x-2 text-center">
                  {(selectedHistoryCycle.days || []).map((day) => (
                    <button key={day.id} onClick={() => { setCurrentViewingDayId(day.id); setActiveView('historicalExecution'); }} className={`text-lg font-black italic p-2 rounded-md transition-all ${day.status === 'completed' ? 'text-[#FACC15]' : 'text-zinc-800'}`}>{String(day.id)}</button>
                  ))}
                </div>
              </div>
            )}

            {(activeView === 'historicalExecution' && selectedHistoryCycle) && (
              <ExecutionView dayId={currentViewingDayId} cycle={selectedHistoryCycle} isHistorical={true} user={user} />
            )}
          </main>

          <div className="fixed bottom-6 left-6 right-6 h-20 bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800/50 rounded-3xl flex items-center justify-around px-4 shadow-2xl z-50">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => {
                  if (item.id === 'config') setShowSettings(true);
                  else {
                    setActiveView(item.id === 'matrix' ? 'grid' : 'grid');
                    setShowSettings(false);
                  }
                }}
                className="flex flex-col items-center gap-1.5 px-3 transition-all active:scale-90"
              >
                <item.icon size={22} className={activeView === item.id || (item.id === 'config' && showSettings) ? 'text-[#FACC15]' : 'text-zinc-600'} />
                <span className={`text-[8px] font-black uppercase tracking-tighter ${activeView === item.id || (item.id === 'config' && showSettings) ? 'text-[#FACC15]' : 'text-zinc-600'}`}>
                  {String(item.label)}
                </span>
                {(activeView === item.id || (item.id === 'config' && showSettings)) && <div className="w-1 h-1 bg-[#FACC15] rounded-full mt-0.5 shadow-[0_0_8px_#FACC15]" />}
              </button>
            ))}
          </div>

          {showSettings && (
            <SettingsOverlay 
              user={user} setUser={setUser} setShowSettings={setShowSettings} 
              avatarInputRef={avatarInputRef} requestAction={requestAction}
              toggleAllHabits={() => setUser({ ...user, habitsConfig: (user.habitsConfig || []).map(h => ({ ...h, active: (user.habitsConfig || []).some(x => !x.active) })) })} 
              toggleAllStrategy={() => setUser({ ...user, strategyConfig: (user.strategyConfig || []).map(s => ({ ...s, active: (user.strategyConfig || []).some(x => !x.active) })) })} 
              addNewHabit={() => { if ((user.habitsConfig || []).length < 5) setUser({ ...user, habitsConfig: [...(user.habitsConfig || []), { id: `h_${Date.now()}`, name: 'NUEVA HABILIDAD', active: true }] }); }} 
              removeHabit={(id) => setUser({ ...user, habitsConfig: (user.habitsConfig || []).filter(h => h.id !== id) })} 
              onLogout={handleLogout}
            />
          )}
        </>
      )}
      <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setUser({...user, avatar: reader.result}); reader.readAsDataURL(file); } }} />
    </AppContainer>
  );
};

export default App;
