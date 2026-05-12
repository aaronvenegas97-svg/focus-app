import React, { useState, useEffect } from 'react';
import {
    Plus,
    Settings,
    ChevronLeft,
    ChevronRight,
    Flame,
    LogOut,
    Mail,
    Lock,
    RefreshCw,
    Database,
    AlertCircle,
} from 'lucide-react';
import { supabase } from './supabase';

// --- COMPONENTES DE UI ---

const Button = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    disabled = false,
    icon: Icon,
    loading = false,
    type = 'button',
}) => {
    const variants = {
          primary:
                  'bg-[#FACC15] text-black hover:bg-[#EAB308] shadow-[0_0_20px_rgba(250,204,21,0.15)]',
          secondary: 'bg-zinc-800 text-white hover:bg-zinc-700',
          outline:
                  'border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-500',
          danger:
                  'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20',
    };

    return (
          <button
                  type={type}
                  onClick={onClick}
                  disabled={disabled || loading}
                  className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-tighter transition-all active:scale-95 disabled:opacity-40 ${variants[variant]} ${className}`}
                >
            {loading ? (
                          <RefreshCw className="animate-spin" size={20} />
                        ) : (
                          <>
                            {Icon && <Icon size={20} />}
                            {children}
                          </>
                        )}
          </button>
        );
};

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    icon: Icon,
}) => (
    <div className="space-y-2">
      {label && (
            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] ml-1">
              {label}
            </label>
        )}
        <div className="relative group">
          {Icon && (
              <Icon
                          className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[#FACC15] transition-colors"
                          size={20}
                        />
            )}
              <input
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className={`w-full bg-zinc-900/40 border border-zinc-800/80 rounded-2xl py-5 ${Icon ? 'pl-14' : 'px-6'} pr-6 text-white outline-none focus:border-[#FACC15] focus:ring-4 focus:ring-[#FACC15]/5 transition-all placeholder:text-zinc-800 font-medium`}
                      />
        </div>
    </div>
  );

// --- VISTA DE AUTENTICACION ---

const AuthView = ({ mode, setMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const handleAuth = async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);
      
          try {
                  if (mode === 'login') {
                            const { error } = await supabase.auth.signInWithPassword({
                                        email,
                                        password,
                            });
                            if (error) throw error;
                  } else {
                            const { error } = await supabase.auth.signUp({
                                        email,
                                        password,
                                        options: { data: { role: 'operator' } },
                            });
                            if (error) throw error;
                            alert(
                                        'Registro iniciado. Por favor, verifica tu correo electronico para activar tu perfil.'
                                      );
                            setMode('login');
                  }
          } catch (err) {
                  setError(err.message || 'Fallo en la comunicacion con el nucleo.');
          } finally {
                  setLoading(false);
          }
    };
  
    return (
          <div className="min-h-screen bg-black flex flex-col p-8">
                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                        <div className="mb-14 space-y-6">
                                  <div className="flex items-center gap-4">
                                              <div className="w-14 h-14 bg-[#FACC15] rounded-2xl flex items-center justify-center font-black text-black italic text-3xl shadow-[0_0_40px_rgba(250,204,21,0.25)]">
                                                            F
                                              </div>
                                              <div className="h-12 w-[2px] bg-zinc-900" />
                                              <div className="flex flex-col">
                                                            <span className="text-zinc-500 font-black tracking-[0.4em] text-[10px] uppercase">
                                                                            Focus App
                                                            </span>
                                                            <span className="text-zinc-700 font-bold text-[9px] uppercase tracking-widest">
                                                                            Protocolo de Alto Rendimiento
                                                            </span>
                                              </div>
                                  </div>
                        
                                  <div>
                                              <h1 className="text-6xl font-black text-white italic tracking-tighter leading-none uppercase mb-2">
                                                {mode === 'login' ? 'Acceso' : 'Registro'}
                                              </h1>h1>
                                              <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.1em]">
                                                {mode === 'login'
                                                                  ? 'Sincronizacion de credenciales'
                                                                  : 'Alta de nuevo operador'}
                                              </p>
                                  </div>
                        </div>
                
                        <form onSubmit={handleAuth} className="space-y-6">
                                  <Input
                                                label="ID Operador"
                                                type="email"
                                                value={email}
                                                onChange={setEmail}
                                                placeholder="operador@focus.net"
                                                icon={Mail}
                                              />
                                  <Input
                                                label="Clave de Acceso"
                                                type="password"
                                                value={password}
                                                onChange={setPassword}
                                                placeholder="••••••••"
                                                icon={Lock}
                                              />
                        
                          {error && (
                        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                      <AlertCircle size={16} /> {error}
                        </div>
                                  )}
                        
                                  <Button type="submit" className="w-full py-6 text-xl" loading={loading}>
                                    {mode === 'login' ? 'AUTENTICAR' : 'REGISTRAR'}
                                  </Button>
                        </form>
                
                        <div className="mt-12 text-center">
                                  <button
                                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                                className="text-zinc-600 hover:text-[#FACC15] text-[10px] font-black uppercase tracking-[0.3em] transition-all"
                                              >
                                    {mode === 'login'
                                                    ? '// Crear cuenta de operador'
                                                    : '// Tengo credenciales de acceso'}
                                  </button>
                        </div>
                </div>
          </div>
        );
};

// --- COMPONENTE PRINCIPAL ---

export default function App() {
    const [session, setSession] = useState(null);
    const [authMode, setAuthMode] = useState('login');
    const [view, setView] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [allCycles, setAllCycles] = useState([]);
  
    // Manejar sesion de Supabase
    useEffect(() => {
          supabase.auth.getSession().then(({ data: { session } }) => {
                  setSession(session);
                  setLoading(false);
          });
      
          const {
                  data: { subscription },
          } = supabase.auth.onAuthStateChange((_event, session) => {
                  setSession(session);
          });
      
          return () => subscription.unsubscribe();
    }, []);
  
    // Cargar datos cuando hay sesion
    useEffect(() => {
          if (session) {
                  fetchRemoteData();
          }
    }, [session]);
  
    const fetchRemoteData = async () => {
          try {
                  const { data } = await supabase
                            .from('cycles')
                            .select('*')
                            .eq('user_id', session.user.id);
                  if (data) setAllCycles(data);
          } catch (e) {
                  console.error('Error fetching remote data:', e);
          }
    };
  
    const handleSave = (updated) => {
          setAllCycles(updated);
    };
  
    const createCycle = async () => {
          const newCycle = {
                  id: Math.random().toString(36).substr(2, 9),
                  label: `DESPLIEGUE 0${allCycles.length + 1}`,
                  currentDay: 1,
                  user_id: session?.user?.id,
                  status: 'active',
          };
          handleSave([...allCycles, newCycle]);
    };
  
    if (loading)
          return (
                  <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
                          <div className="w-20 h-20 border-t-2 border-l-2 border-[#FACC15] rounded-full animate-spin shadow-[0_0_30px_rgba(250,204,21,0.1)]" />
                          <div className="text-[#FACC15] text-[10px] font-black italic tracking-[0.8em] animate-pulse uppercase">
                                    Protocol Sincronizing...
                          </div>
                  </div>
                );
  
    if (!session)
          return <AuthView mode={authMode} setMode={setAuthMode} />;
  
    return (
          <div className="min-h-screen bg-black text-white font-sans selection:bg-[#FACC15] selection:text-black">
            {/* Header */}
                <header className="p-6 flex items-center justify-between border-b border-zinc-900 sticky top-0 bg-black/90 backdrop-blur-2xl z-50">
                        <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-[#FACC15] rounded-xl flex items-center justify-center font-black text-black italic shadow-md">
                                              F
                                  </div>
                                  <div className="hidden sm:block">
                                              <h2 className="text-[10px] font-black tracking-[0.3em] uppercase">
                                                            Focus Console
                                              </h2>h2>
                                              <p className="text-[9px] text-zinc-600 font-bold uppercase truncate max-w-[150px]">
                                                {session.user.email}
                                              </p>
                                  </div>
                        </div>
                        <div className="flex gap-2">
                                  <button
                                                onClick={() => setView('settings')}
                                                className="p-3 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-white transition-all"
                                              >
                                              <Settings size={20} />
                                  </button>
                                  <button
                                                onClick={() => supabase.auth.signOut()}
                                                className="p-3 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-red-500 transition-all"
                                              >
                                              <LogOut size={20} />
                                  </button>
                        </div>
                </header>
          
                <main className="p-6 max-w-2xl mx-auto pb-40">
                  {view === 'dashboard' && (
                      <div className="space-y-12">
                                  <div className="flex items-end justify-between border-l-4 border-[#FACC15] pl-8 py-4">
                                                <div>
                                                                <h3 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mb-1">
                                                                                  Status de Red
                                                                </h3>h3>
                                                                <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                                                                                  Mis Ciclos
                                                                </h1>h1>
                                                </div>
                                                <Button onClick={createCycle} icon={Plus} className="px-10">
                                                                Nuevo
                                                </Button>
                                  </div>
                      
                                  <div className="grid gap-6">
                                    {allCycles.length === 0 ? (
                                        <div className="py-32 text-center border-2 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-950/20 group hover:border-zinc-800 transition-colors">
                                                          <Database
                                                                                className="mx-auto mb-6 text-zinc-800 group-hover:text-zinc-700 transition-colors"
                                                                                size={48}
                                                                              />
                                                          <p className="text-zinc-700 text-xs font-black uppercase tracking-[0.4em]">
                                                                              Nucleo de datos vacio
                                                          </p>
                                                          <p className="text-zinc-800 text-[9px] mt-2 font-bold uppercase">
                                                                              Inicia un ciclo de 92 dias para registrar
                                                          </p>
                                        </div>
                                      ) : (
                                        allCycles.map((c) => (
                                                            <div
                                                                                  key={c.id}
                                                                                  className="group bg-zinc-900/10 border border-zinc-800/60 p-8 rounded-[2.5rem] flex items-center justify-between hover:border-[#FACC15]/40 hover:bg-zinc-900/30 transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]"
                                                                                >
                                                                                <div className="flex items-center gap-7">
                                                                                                      <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-800 group-hover:text-[#FACC15] transition-all border border-zinc-800 group-hover:shadow-[0_0_20px_rgba(250,204,21,0.1)]">
                                                                                                                              <Flame size={32} />
                                                                                                        </div>
                                                                                                      <div className="space-y-1.5">
                                                                                                                              <h4 className="font-black italic text-2xl uppercase tracking-tighter text-zinc-500 group-hover:text-white transition-colors">
                                                                                                                                {c.label}
                                                                                                                                </h4>h4>
                                                                                                                              <div className="flex items-center gap-4">
                                                                                                                                                        <span className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.2em] group-hover:text-zinc-400 transition-colors">
                                                                                                                                                                                    Dia {c.currentDay} // 92
                                                                                                                                                          </span>
                                                                                                                                                        <div className="w-32 h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                                                                                                                                                                                    <div
                                                                                                                                                                                                                    className="h-full bg-[#FACC15] shadow-[0_0_10px_#FACC15]"
                                                                                                                                                                                                                    style={{ width: `${(c.currentDay / 92) * 100}%` }}
                                                                                                                                                                                                                  />
                                                                                                                                                          </div>
                                                                                                                                </div>
                                                                                                        </div>
                                                                                  </div>
                                                                                <ChevronRight
                                                                                                        className="text-zinc-800 group-hover:translate-x-2 group-hover:text-white transition-all"
                                                                                                        size={28}
                                                                                                      />
                                                            </div>
                                                          ))
                                      )}
                                  </div>
                      </div>
                        )}
                
                  {view === 'settings' && (
                      <div className="space-y-12">
                                  <button
                                                  onClick={() => setView('dashboard')}
                                                  className="flex items-center gap-3 text-zinc-700 font-black uppercase text-[10px] hover:text-white transition-all tracking-[0.2em]"
                                                >
                                                <ChevronLeft size={16} /> Volver al panel
                                  </button>
                                  <h1 className="text-6xl font-black italic tracking-tighter uppercase">
                                                Sistema
                                  </h1>h1>
                      
                                  <div className="space-y-8">
                                                <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-[3rem]">
                                                                <h4 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mb-6">
                                                                                  Estado de Conexion
                                                                </h4>h4>
                                                                <div className="flex items-center gap-5 bg-zinc-950/50 p-6 rounded-3xl border border-zinc-900/50">
                                                                                  <div className="w-5 h-5 rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-pulse" />
                                                                                  <div>
                                                                                                      <span className="text-sm font-black text-white tracking-widest uppercase block">
                                                                                                                            Red Operativa
                                                                                                        </span>
                                                                                                      <span className="text-[10px] text-zinc-700 font-bold uppercase italic">
                                                                                                                            Sincronizacion Cloud Activada
                                                                                                        </span>
                                                                                    </div>
                                                                </div>
                                                </div>
                                                <div className="p-8 border-t border-zinc-900">
                                                                <h4 className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                                                                                  Perfil Autenticado
                                                                </h4>h4>
                                                                <p className="text-lg font-bold text-zinc-400 font-mono tracking-tight">
                                                                  {session.user.email}
                                                                </p>
                                                </div>
                                  </div>
                      </div>
                        )}
                </main>
          
            {/* Footer */}
                <footer className="fixed bottom-0 left-0 right-0 p-6 border-t border-zinc-900 bg-black/95 backdrop-blur-xl flex justify-around items-center z-40">
                        <div className="text-center">
                                  <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.4em] mb-1">
                                              Estado
                                  </p>
                                  <p className="text-sm font-black italic text-[#FACC15] tracking-[0.2em]">
                                              ACTIVE
                                  </p>
                        </div>
                        <div className="h-8 w-[1px] bg-zinc-900" />
                        <div className="text-center">
                                  <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.4em] mb-1">
                                              Encripcion
                                  </p>
                                  <p className="text-sm font-black italic text-zinc-500 tracking-[0.2em]">
                                              AES-256
                                  </p>
                        </div>
                </footer>
          </div>
        );
}
