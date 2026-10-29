/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, RefreshCw, Send, CheckCircle2, AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resendVerification } from '../services/authService';

export const EmailVerificationBanner: React.FC = () => {
  const { user, emailVerified, refreshVerification, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!user || emailVerified) return null;

  const handleCheck = async () => {
    setChecking(true);
    setFeedback(null);
    try {
      const verified = await refreshVerification();
      if (verified) {
        setFeedback('¡Correo verificado con éxito! Tu cuenta está completamente habilitada.');
      } else {
        setFeedback('Aún no detectamos la confirmación. Por favor haz clic en el enlace recibido en tu correo.');
      }
    } catch {
      setFeedback('Error al comprobar la verificación.');
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setFeedback(null);
    try {
      await resendVerification();
      setFeedback('¡Correo de confirmación enviado! Revisa tu bandeja de entrada y spam.');
    } catch (err: any) {
      setFeedback('Error al enviar el correo. Espera unos minutos antes de reintentar.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-amber-950/70 border-b border-amber-600/40 px-4 py-2.5 text-xs text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-white">Confirma tu correo ({user.email}):</strong> Para guardar canciones en la nube, debes hacer clic en el enlace de verificación enviado a tu bandeja.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCheck}
            disabled={checking}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Comprobando...' : 'Comprobar confirmación'}
          </button>

          <button
            onClick={handleResend}
            disabled={resending}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {resending ? 'Enviando...' : 'Reenviar enlace'}
          </button>

          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-1 text-amber-400/80 hover:text-amber-200 transition-colors ml-1"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {feedback && (
        <div className="max-w-7xl mx-auto mt-1 text-[11px] font-medium text-amber-300">
          {feedback}
        </div>
      )}
    </div>
  );
};
