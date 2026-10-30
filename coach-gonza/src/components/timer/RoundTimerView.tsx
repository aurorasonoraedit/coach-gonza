import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Timer, Minus, Plus, Volume2 } from 'lucide-react';

type Phase = 'idle' | 'prep' | 'round' | 'rest' | 'done';

interface Config {
  rounds: number;
  roundSec: number;
  restSec: number;
  warnSec: number; // aviso antes de terminar el round (0 = sin aviso)
}

const PRESETS: { id: string; label: string; detail: string; config: Config }[] = [
  { id: 'amateur', label: 'Amateur', detail: '3 × 3:00 · 1:00', config: { rounds: 3, roundSec: 180, restSec: 60, warnSec: 10 } },
  { id: 'pro', label: 'Profesional', detail: '12 × 3:00 · 1:00', config: { rounds: 12, roundSec: 180, restSec: 60, warnSec: 10 } },
  { id: 'fem', label: 'Pro femenino', detail: '10 × 2:00 · 1:00', config: { rounds: 10, roundSec: 120, restSec: 60, warnSec: 10 } },
  { id: 'clase', label: 'Bolsa / manoplas', detail: '6 × 3:00 · 0:30', config: { rounds: 6, roundSec: 180, restSec: 30, warnSec: 10 } },
  { id: 'tabata', label: 'Tabata', detail: '8 × 0:20 · 0:10', config: { rounds: 8, roundSec: 20, restSec: 10, warnSec: 0 } }
];

const PREP_SEC = 10;
const STORE_KEY = 'boxcoach_timer_config_v1';

const loadConfig = (): Config => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return { ...PRESETS[0].config, ...JSON.parse(raw) };
  } catch { /* nada */ }
  return PRESETS[0].config;
};

const mmss = (sec: number) => {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// ---------- Sonidos (generados, sin archivos) ----------
let audioCtx: AudioContext | null = null;
const getCtx = () => {
  if (!audioCtx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

// Campana de ring: parciales inarmónicos con caída larga
const bell = (times = 1, gap = 0.32) => {
  const ctx = getCtx();
  const t0 = ctx.currentTime + 0.02;
  for (let i = 0; i < times; i++) {
    const t = t0 + i * gap;
    [[1, 0.5], [2.76, 0.25], [5.4, 0.12], [8.93, 0.06]].forEach(([mult, vol]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880 * mult;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6 / Math.sqrt(mult));
      osc.connect(g).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.8);
    });
  }
};

// Golpe de madera (aviso de 10 segundos)
const clap = (times = 3) => {
  const ctx = getCtx();
  const t0 = ctx.currentTime + 0.02;
  for (let i = 0; i < times; i++) {
    const t = t0 + i * 0.16;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.05);
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }
};

const beep = (high = false) => {
  const ctx = getCtx();
  const t = ctx.currentTime + 0.01;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.frequency.value = high ? 1320 : 880;
  g.gain.setValueAtTime(0.25, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.2);
};

// ---------- Componente ----------
const Stepper: React.FC<{
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
}> = ({ label, value, onMinus, onPlus }) => (
  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-center">
    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{label}</span>
    <div className="flex items-center justify-between mt-1">
      <button onClick={onMinus} aria-label={`Menos ${label}`} className="p-1.5 rounded-lg bg-zinc-800 text-zinc-200 cursor-pointer active:scale-95">
        <Minus className="w-4 h-4" />
      </button>
      <span className="text-base font-black text-white tabular-nums">{value}</span>
      <button onClick={onPlus} aria-label={`Más ${label}`} className="p-1.5 rounded-lg bg-zinc-800 text-zinc-200 cursor-pointer active:scale-95">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export const RoundTimerView: React.FC = () => {
  const [config, setConfig] = useState<Config>(loadConfig);
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(1);
  const [remaining, setRemaining] = useState(config.roundSec);
  const [running, setRunning] = useState(false);

  const endAt = useRef(0); // timestamp en ms en que termina la fase actual
  const pausedLeft = useRef(0);
  const warned = useRef(false);
  const lastBeep = useRef(-1);
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(config)); } catch { /* nada */ }
    if (phase === 'idle') setRemaining(config.roundSec);
  }, [config, phase]);

  // Mantener la pantalla encendida mientras corre
  const lockScreen = useCallback(async () => {
    try {
      const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
      if (nav.wakeLock && !wakeLock.current) wakeLock.current = await nav.wakeLock.request('screen');
    } catch { /* no soportado */ }
  }, []);
  const unlockScreen = useCallback(() => {
    wakeLock.current?.release().catch(() => {});
    wakeLock.current = null;
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && running) {
        wakeLock.current = null;
        lockScreen();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [running, lockScreen]);

  useEffect(() => () => unlockScreen(), [unlockScreen]);

  const startPhase = (p: Phase, seconds: number) => {
    setPhase(p);
    endAt.current = Date.now() + seconds * 1000;
    warned.current = false;
    lastBeep.current = -1;
    setRemaining(seconds);
  };

  const advance = useCallback(() => {
    if (phase === 'prep') {
      bell(1);
      startPhase('round', config.roundSec);
    } else if (phase === 'round') {
      if (round >= config.rounds) {
        bell(3);
        setPhase('done');
        setRunning(false);
        setRemaining(0);
        unlockScreen();
      } else if (config.restSec > 0) {
        bell(2);
        startPhase('rest', config.restSec);
      } else {
        bell(1);
        setRound(r => r + 1);
        startPhase('round', config.roundSec);
      }
    } else if (phase === 'rest') {
      bell(1);
      setRound(r => r + 1);
      startPhase('round', config.roundSec);
    }
  }, [phase, round, config, unlockScreen]);

  // Reloj
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const left = (endAt.current - Date.now()) / 1000;
      setRemaining(left);
      const whole = Math.ceil(left);
      if (phase === 'round' && config.warnSec > 0 && !warned.current && left <= config.warnSec && config.roundSec > config.warnSec + 5) {
        warned.current = true;
        clap(3);
      }
      if ((phase === 'prep' || phase === 'rest') && whole <= 3 && whole >= 1 && lastBeep.current !== whole) {
        lastBeep.current = whole;
        beep(false);
      }
      if (left <= 0) advance();
    }, 100);
    return () => window.clearInterval(id);
  }, [running, phase, config, advance]);

  const handleStartPause = () => {
    getCtx(); // iPhone: el audio se habilita con un toque del usuario
    if (running) {
      pausedLeft.current = Math.max(0, endAt.current - Date.now());
      setRunning(false);
      unlockScreen();
      return;
    }
    if (phase === 'idle' || phase === 'done') {
      setRound(1);
      startPhase('prep', PREP_SEC);
    } else {
      endAt.current = Date.now() + pausedLeft.current;
    }
    setRunning(true);
    lockScreen();
  };

  const handleReset = () => {
    setRunning(false);
    setPhase('idle');
    setRound(1);
    setRemaining(config.roundSec);
    unlockScreen();
  };

  const handleSkip = () => {
    if (phase === 'idle' || phase === 'done') return;
    if (!running) {
      // salto en pausa: avanzar y seguir en pausa
      advance();
      pausedLeft.current = Math.max(0, endAt.current - Date.now());
      return;
    }
    advance();
  };

  const totalPhase = phase === 'prep' ? PREP_SEC : phase === 'rest' ? config.restSec : config.roundSec;
  const pct = phase === 'idle' ? 1 : phase === 'done' ? 0 : Math.max(0, Math.min(1, remaining / totalPhase));
  const inWarning = phase === 'round' && config.warnSec > 0 && remaining <= config.warnSec;

  const theme =
    phase === 'round'
      ? inWarning
        ? { ring: '#f59e0b', label: 'text-amber-400', bg: 'from-amber-950/50' }
        : { ring: '#ef4444', label: 'text-red-400', bg: 'from-red-950/50' }
      : phase === 'rest'
      ? { ring: '#10b981', label: 'text-emerald-400', bg: 'from-emerald-950/50' }
      : phase === 'prep'
      ? { ring: '#3b82f6', label: 'text-blue-400', bg: 'from-blue-950/50' }
      : { ring: '#52525b', label: 'text-zinc-300', bg: 'from-zinc-900' };

  const phaseLabel =
    phase === 'prep' ? '¡Preparate!' :
    phase === 'round' ? `Round ${round} de ${config.rounds}` :
    phase === 'rest' ? `Descanso · R${round + 1} en` :
    phase === 'done' ? '¡Terminado! 🥊' :
    `${config.rounds} rounds de ${mmss(config.roundSec)}`;

  const R = 108;
  const C = 2 * Math.PI * R;
  const setCfg = (patch: Partial<Config>) => setConfig(c => ({ ...c, ...patch }));
  const activePreset = PRESETS.find(
    p => p.config.rounds === config.rounds && p.config.roundSec === config.roundSec && p.config.restSec === config.restSec
  )?.id;
  const editable = phase === 'idle' || phase === 'done';

  return (
    <div className="space-y-4">
      <div className={`bg-gradient-to-b ${theme.bg} to-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl`}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Timer className="w-5 h-5 text-red-500" /> Timer de rounds
          </h2>
          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" /> Sacá el modo silencio
          </span>
        </div>

        {/* Reloj */}
        <div className="relative mx-auto mt-4 w-64 h-64 max-w-full">
          <svg viewBox="0 0 240 240" className="w-full h-full -rotate-90">
            <circle cx="120" cy="120" r={R} stroke="#27272a" strokeWidth="12" fill="none" />
            <circle
              cx="120"
              cy="120"
              r={R}
              stroke={theme.ring}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - pct)}
              style={{ transition: 'stroke-dashoffset 0.12s linear, stroke 0.3s' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`text-xs font-black uppercase tracking-wider ${theme.label}`}>{phaseLabel}</span>
            <span className={`text-6xl font-black tabular-nums mt-1 ${inWarning ? 'text-amber-300' : 'text-white'}`}>
              {phase === 'done' ? '0:00' : mmss(remaining)}
            </span>
            {phase !== 'idle' && phase !== 'done' && (
              <div className="flex gap-1 mt-3">
                {Array.from({ length: Math.min(config.rounds, 12) }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i + 1 < round || (i + 1 === round && phase === 'rest') ? 'bg-red-500' : i + 1 === round ? 'bg-white' : 'bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={handleReset}
            aria-label="Reiniciar"
            className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={handleStartPause}
            aria-label={running ? 'Pausar' : 'Empezar'}
            className={`w-20 h-20 rounded-full text-white flex items-center justify-center shadow-lg cursor-pointer active:scale-95 ${
              running ? 'bg-zinc-700 border border-zinc-600' : 'bg-red-600 border border-red-500 shadow-red-950/60'
            }`}
          >
            {running ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button
            onClick={handleSkip}
            disabled={editable}
            aria-label="Saltar fase"
            className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-40"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-zinc-500 mt-3">
          Campana al empezar y terminar cada round · golpe de aviso a los {config.warnSec || '—'} segundos del final
        </p>
      </div>

      {/* Configuración */}
      <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 ${editable ? '' : 'opacity-50 pointer-events-none'}`}>
        <p className="text-xs font-bold text-white uppercase tracking-wider">Configuración</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => setConfig(p.config)}
              className={`text-left px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                activePreset === p.id ? 'bg-red-950/70 border-red-600' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <span className="block text-xs font-bold text-white">{p.label}</span>
              <span className="block text-[10px] text-zinc-400">{p.detail}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stepper
            label="Rounds"
            value={String(config.rounds)}
            onMinus={() => setCfg({ rounds: Math.max(1, config.rounds - 1) })}
            onPlus={() => setCfg({ rounds: Math.min(30, config.rounds + 1) })}
          />
          <Stepper
            label="Duración round"
            value={mmss(config.roundSec)}
            onMinus={() => setCfg({ roundSec: Math.max(10, config.roundSec - (config.roundSec > 60 ? 30 : 10)) })}
            onPlus={() => setCfg({ roundSec: Math.min(600, config.roundSec + (config.roundSec >= 60 ? 30 : 10)) })}
          />
          <Stepper
            label="Descanso"
            value={mmss(config.restSec)}
            onMinus={() => setCfg({ restSec: Math.max(0, config.restSec - (config.restSec > 60 ? 30 : 10)) })}
            onPlus={() => setCfg({ restSec: Math.min(300, config.restSec + (config.restSec >= 60 ? 30 : 10)) })}
          />
          <Stepper
            label="Aviso antes del final"
            value={config.warnSec ? `${config.warnSec} s` : 'No'}
            onMinus={() => setCfg({ warnSec: Math.max(0, config.warnSec - 5) })}
            onPlus={() => setCfg({ warnSec: Math.min(30, config.warnSec + 5) })}
          />
        </div>
        <button
          onClick={() => { getCtx(); bell(1); }}
          className="w-full text-xs font-semibold text-zinc-300 bg-zinc-950 border border-zinc-800 rounded-xl py-2 cursor-pointer"
        >
          🔔 Probar la campana
        </button>
      </div>
    </div>
  );
};
