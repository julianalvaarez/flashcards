'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Dashboard from '@/components/Dashboard';
import { Loader2, LogIn } from 'lucide-react';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setAuthStatus('loading');

    try {
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && data.session) {
          // Si confirm_email está desactivado en Supabase, entra directo
          setSession(data.session);
        } else {
          alert('¡Cuenta creada! Si el administrador no ha desactivado la confirmación, revisa tu email.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message === 'Invalid login credentials' ? 'Credenciales incorrectas' : err.message);
    } finally {
      setAuthStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 animate-fade-in">
        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-accent/20">
            <GraduationCap size={32} className="text-white" />
          </div>
          
          <h1 className="text-3xl font-black mb-1">
            {view === 'login' ? 'Bienvenido' : 'Crear Cuenta'}
          </h1>
          <p className="text-muted text-sm mb-8 text-center">
            {view === 'login' ? 'Ingresa tus credenciales para estudiar.' : 'Comienza tu viaje hacia la fluidez hoy mismo.'}
          </p>

          <form onSubmit={handleAuth} className="w-full flex flex-col gap-4">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Email</label>
              <input
                type="email"
                required
                placeholder="tu@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-all placeholder:text-muted/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-all placeholder:text-muted/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-lg animate-fade-in">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={authStatus === 'loading'}
              className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50 mt-2 shadow-lg shadow-white/5 flex items-center justify-center gap-2"
            >
              {authStatus === 'loading' && <Loader2 size={18} className="animate-spin" />}
              {view === 'login' ? 'Iniciar Sesión' : 'Registrarse Ahora'}
            </button>
          </form>

          <button 
            onClick={() => {
              setView(view === 'login' ? 'signup' : 'login');
              setErrorMsg(null);
            }}
            className="mt-8 text-xs text-muted hover:text-foreground transition-colors"
          >
            {view === 'login' ? (
              <>¿No tienes cuenta? <span className="text-accent font-bold">Regístrate gratis</span></>
            ) : (
              <>¿Ya eres miembro? <span className="text-accent font-bold">Inicia sesión</span></>
            )}
          </button>
        </div>

        <p className="mt-auto pt-10 text-[10px] text-muted/30 uppercase tracking-[0.2em] font-medium">
          Powered by FlashVocab Engine
        </p>
      </div>
    );
  }

  return <Dashboard />;
}

function GraduationCap({ size, className }: { size: number, className: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
