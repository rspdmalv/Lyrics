/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { X, FileText, RefreshCw, CheckCircle2, LogIn, UserPlus, Music, Trash2, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserLogs } from '../services/firestoreService';
import { ActivityLog } from '../types';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserLogs(user.uid);
      setLogs(data);
    } catch (err: any) {
      console.warn('Error fetching logs:', err);
      setError('No se pudieron cargar los registros de auditoría.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchLogs();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const getActionBadge = (action: ActivityLog['action']) => {
    switch (action) {
      case 'register':
        return {
          icon: <UserPlus className="w-3.5 h-3.5 text-blue-400" />,
          label: 'Registro',
          color: 'bg-blue-950/60 border-blue-800/60 text-blue-300',
        };
      case 'login':
        return {
          icon: <LogIn className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Inicio de Sesión',
          color: 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300',
        };
      case 'email_verified':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Verificación',
          color: 'bg-amber-950/60 border-amber-800/60 text-amber-300',
        };
      case 'song_create':
      case 'song_edit':
        return {
          icon: <Music className="w-3.5 h-3.5 text-purple-400" />,
          label: action === 'song_create' ? 'Canción Creada' : 'Canción Editada',
          color: 'bg-purple-950/60 border-purple-800/60 text-purple-300',
        };
      case 'song_delete':
        return {
          icon: <Trash2 className="w-3.5 h-3.5 text-red-400" />,
          label: 'Canción Eliminada',
          color: 'bg-red-950/60 border-red-800/60 text-red-300',
        };
      case 'rehearsal_start':
        return {
          icon: <Play className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Ensayo',
          color: 'bg-amber-950/60 border-amber-800/60 text-amber-300',
        };
      default:
        return {
          icon: <FileText className="w-3.5 h-3.5 text-zinc-400" />,
          label: 'Evento',
          color: 'bg-zinc-800 border-zinc-700 text-zinc-300',
        };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('es-ES', {
        dateStyle: 'short',
        timeStyle: 'medium',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Registro de Actividad (Auditoría Cloud)</h3>
              <p className="text-xs text-zinc-400">
                Historial de eventos guardados en Firestore para {user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              title="Refrescar logs"
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-3">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-200">
              {error}
            </div>
          )}

          {loading && logs.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
              Cargando historial de eventos desde la base de datos...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              No hay registros de auditoría registrados aún.
            </div>
          ) : (
            <div className="space-y-2.5">
              {logs.map(log => {
                const badge = getActionBadge(log.action);
                return (
                  <div
                    key={log.id}
                    className="p-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${badge.color}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-zinc-200 font-medium">{log.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between text-xs text-zinc-400">
          <span>Total eventos: {logs.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
