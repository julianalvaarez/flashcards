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
  const [authMethod, setAuthMethod] = useState<'magic' | 'password'>('magic');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'sent'>('idle');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setAuthStatus('loading');

    if (authMethod === 'magic') {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) { alert(error.message); setAuthStatus('idle'); }
      else { setAuthStatus('sent'); }
    } else {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) alert(error.message);
        else alert('¡Cuenta creada! Revisa tu email para confirmar.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert(error.message);
      }
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
      <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-6 rotate-3 shadow-2xl shadow-accent/10">
          <GraduationCap size={40} className="text-accent" />
        </div>
        <h1 className="text-4xl font-black mb-2 tracking-tight">FlashVocab</h1>
        <p className="text-muted mb-8 max-w-sm text-base leading-relaxed">
          Domina el inglés con repetición espaciada.
        </p>

        <div className="w-full max-w-sm">
          {authStatus === 'sent' ? (
            <div className="glass p-6 border-green-500/20 bg-green-500/5 animate-fade-in">
              <p className="text-green-400 font-medium">¡Link enviado! Revisa tu email para entrar.</p>
              <button onClick={() => setAuthStatus('idle')} className="mt-4 text-xs text-muted underline">Volver</button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Tab Selector */}
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <button 
                  onClick={() => setAuthMethod('magic')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMethod === 'magic' ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-foreground'}`}
                >
                  LINK MÁGICO
                </button>
                <button 
                  onClick={() => setAuthMethod('password')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMethod === 'password' ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-foreground'}`}
                >
                  CONTRASEÑA
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                
                {authMethod === 'password' && (
                  <input
                    type="password"
                    placeholder="Contraseña"
                    autoComplete={isRegistering ? "new-password" : "current-password"}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-all animate-fade-in"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                )}

                <button
                  type="submit"
                  disabled={authStatus === 'loading'}
                  className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {authStatus === 'loading' ? 'Cargando...' : 
                    authMethod === 'magic' ? 'Enviar Link de Acceso' : 
                    (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')}
                </button>
              </form>

              {authMethod === 'password' && (
                <button 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-xs text-muted hover:text-accent transition-colors"
                >
                  {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                </button>
              )}
            </div>
          )}
        </div>

        <p className="mt-12 text-[10px] text-muted/50 max-w-xs uppercase tracking-widest">
          Requiere cuenta de Supabase configurada
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
