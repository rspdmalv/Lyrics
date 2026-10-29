/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, CheckCircle2, AlertTriangle, RefreshCw, Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registerUser, loginUser, resendVerification, resetUserPassword, getFriendlyAuthErrorMessage } from '../services/authService';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, setAuthModalMode, user, refreshVerification } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  if (!isAuthModalOpen) return null;

  const resetForm = () => {
    setError(null);
    setSuccessMessage(null);
    setJustRegistered(false);
  };

  const handleSwitchMode = (mode: 'login' | 'register' | 'forgot') => {
    resetForm();
    setAuthModalMode(mode);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginUser(email, password);
      closeAuthModal();
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyAuthErrorMessage(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      await registerUser(email, password, displayName);
      setJustRegistered(true);
      setSuccessMessage(`¡Cuenta creada! Hemos enviado un enlace de confirmación a ${email}.`);
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyAuthErrorMessage(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await resetUserPassword(email);
      setSuccessMessage('Te hemos enviado un correo con instrucciones para restablecer tu contraseña.');
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyAuthErrorMessage(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setLoading(true);
    try {
      await resendVerification();
      setSuccessMessage('¡Correo de confirmación reenviado! Revisa tu bandeja de entrada o spam.');
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err?.code || err?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckNow = async () => {
    setCheckingVerification(true);
    setError(null);
    try {
      const verified = await refreshVerification();
      if (verified) {
        setSuccessMessage('¡Genial! Tu correo ha sido verificado con éxito. Tu cuenta ya está lista.');
        setTimeout(() => {
          closeAuthModal();
        }, 1500);
      } else {
        setError('Aún no hemos detectado la confirmación. Por favor haz clic en el enlace recibido en tu correo y vuelve a comprobar.');
      }
    } catch (err: any) {
      setError('Error al comprobar la verificación.');
    } finally {
      setCheckingVerification(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/40">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              {justRegistered
                ? 'Confirmar Correo Electrónico'
                : authModalMode === 'login'
                ? 'Iniciar Sesión'
                : authModalMode === 'register'
                ? 'Crear Cuenta'
                : 'Recuperar Contraseña'}
            </h3>
            <p className="text-xs text-zinc-400">StageLyrics Cloud & Base de Datos</p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Notifications */}
          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Just registered confirmation view */}
          {justRegistered ? (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">Confirma tu correo</h4>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  Te hemos enviado un correo a <span className="font-semibold text-amber-300">{email}</span> con un enlace de activación.
                  Debes confirmarlo para que tu cuenta quede habilitada y puedas guardar canciones en la nube.
                </p>
              </div>

              <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800 text-left text-xs text-zinc-400 space-y-1">
                <p>1. Abre tu bandeja de entrada o carpeta de spam.</p>
                <p>2. Haz clic en el enlace de Firebase para verificar.</p>
                <p>3. Vuelve aquí y pulsa "Comprobar confirmación".</p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleCheckNow}
                  disabled={checkingVerification}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${checkingVerification ? 'animate-spin' : ''}`} />
                  {checkingVerification ? 'Comprobando...' : 'Comprobar confirmación ahora'}
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Reenviar correo de confirmación
                </button>
              </div>
            </div>
          ) : authModalMode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu-correo@ejemplo.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-300">Contraseña</label>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot')}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>

              <div className="pt-2 text-center text-xs text-zinc-400">
                ¿No tienes cuenta todavía?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('register')}
                  className="font-semibold text-amber-400 hover:text-amber-300 transition-colors ml-1"
                >
                  Crear cuenta gratis
                </button>
              </div>
            </form>
          ) : authModalMode === 'register' ? (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Nombre o Banda (opcional)</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Ej. Juan Pérez o Los Rockers"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Correo electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu-correo@ejemplo.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Contraseña (mínimo 6 caracteres)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Confirmar contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
                ℹ️ Al registrarte, Firebase te enviará un correo con un enlace de verificación para habilitar el uso y sincronización segura de tus canciones.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>

              <div className="pt-1 text-center text-xs text-zinc-400">
                ¿Ya tienes una cuenta registrada?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="font-semibold text-amber-400 hover:text-amber-300 transition-colors ml-1"
                >
                  Inicia sesión
                </button>
              </div>
            </form>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver a Iniciar Sesión
              </button>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Ingresa tu correo electrónico registrado y te enviaremos un enlace oficial para que puedas restablecer tu contraseña.
              </p>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu-correo@ejemplo.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
