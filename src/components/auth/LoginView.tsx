/**
 * Login de comerciante — solo visible en modo Supabase (sin sesión activa).
 * Email + password vía Supabase Auth. Los clientes del catálogo público no
 * pasan por aquí: acceden directamente con ?tienda=<slug>.
 */
import React, { useState } from 'react';
import { useAuthExtras } from '../../context/store';
import { Cloud, LockKeyhole, Mail, UserPlus, LogIn } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { signIn, signUp } = useAuthExtras();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setBusy(false);
      return;
    }
    const err = mode === 'in'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password, fullName.trim() || 'Comerciante');
    if (err) setError(err);
    else if (mode === 'up') setInfo('Cuenta creada. Revisa tu correo si es necesario confirmar y luego inicia sesión.');
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 shadow-lg mb-3">
            <Cloud className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Mitra POS Arequipa</h1>
          <p className="text-blue-200/80 text-sm mt-1">Panel del comerciante · datos en la nube (Supabase)</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-4">
          <div className="flex rounded-lg bg-slate-100 p-1 text-sm font-semibold">
            <button type="button" onClick={() => setMode('in')}
              className={`flex-1 py-1.5 rounded-md transition ${mode === 'in' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>
              Iniciar sesión
            </button>
            <button type="button" onClick={() => setMode('up')}
              className={`flex-1 py-1.5 rounded-md transition ${mode === 'up' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>
              Crear cuenta
            </button>
          </div>

          {mode === 'up' && (
            <label className="block">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nombre del comerciante</span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej.: María Quispe"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </label>
          )}

          <label className="block">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Correo electrónico</span>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-correo@ejemplo.com"
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Contraseña</span>
            <div className="relative mt-1">
              <LockKeyhole className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="mínimo 6 caracteres"
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          {info && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{info}</p>
          )}

          <button type="submit" disabled={busy}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold py-2.5 transition">
            {mode === 'in' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {busy ? 'Procesando…' : mode === 'in' ? 'Entrar a mi tienda' : 'Registrarme'}
          </button>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Tus ventas, inventario y pedidos WhatsApp se guardan de forma segura en Supabase
            con aislamiento por tienda (RLS). ¿Eres cliente? Pide por el enlace público{' '}
            <code className="font-mono">?tienda=slug</code> de tu comercio.
          </p>
        </form>
      </div>
    </div>
  );
};
