import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, SkipForward, Minus, Plus, Volume2, X, Bell } from 'lucide-react';
import { askConfirm } from '../../utils/confirm';

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
  <div className="py-3 flex items-center justify-between gap-3">
    <span className="text-sm font-semibold text-zinc-300">{label}</span>
    <div className="flex items-center gap-2">
      <button onClick={onMinus} aria-label={`Menos: ${label}`} className="w-11 h-11 rounded-xl bg-zinc-800 text-white flex items-center justify-center cursor-pointer active:scale-95">
        <Minus className="w-5 h-5" />
      </button>
      <span className="w-16 text-center font-display font-bold text-2xl text-white tabular">{value}</span>
      <button onClick={onPlus} aria-label={`Más: ${label}`} className="w-11 h-11 rounded-xl bg-zinc-800 text-white flex items-center justify-center cursor-pointer active:scale-95">
        <Plus className="w-5 h-5" />
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

  const handleStop = async () => {
    const midSession = phase === 'prep' || phase === 'round' || phase === 'rest';
    if (midSession && !(await askConfirm('¿Cortar el timer? Se pierde el round en curso.', { okLabel: 'Cortar' }))) return;
    handleReset();
  };

  const inWarning = phase === 'round' && config.warnSec > 0 && remaining <= config.warnSec;
  const setCfg = (patch: Partial<Config>) => setConfig(c => ({ ...c, ...patch }));
  const activePreset = PRESETS.find(
    p => p.config.rounds === config.rounds && p.config.roundSec === config.roundSec && p.config.restSec === config.restSec
  )?.id;
  const totalTime = config.rounds * config.roundSec + Math.max(0, config.rounds - 1) * config.restSec;

  // ---------- Modo ring: pantalla completa mientras hay rounds en curso ----------
  if (phase !== 'idle') {
    const bg =
      phase === 'round' ? (inWarning ? 'bg-amber-600' : 'bg-ring-red')
      : phase === 'rest' ? 'bg-green-600'
      : 'bg-zinc-950';
    const label =
      phase === 'prep' ? 'Preparate'
      : phase === 'round' ? (inWarning ? 'Últimos segundos' : 'Round')
      : phase === 'rest' ? 'Descanso'
      : 'Terminado';
    const clock = phase === 'done' ? mmss(totalTime) : mmss(remaining);
    const paused = !running && phase !== 'done';

    return (
      <div
        className={`fixed inset-0 z-[90] ${bg} text-white flex flex-col select-none`}
        role="timer"
        aria-live="polite"
        aria-label={`${label}, round ${round} de ${config.rounds}, quedan ${mmss(remaining)}`}
      >
        {/* Arriba: round actual y cortar */}
        <div className="safe-top px-5 flex items-start justify-between">
          <div className="font-display font-extrabold leading-none tabular">
            <span className="text-5xl">{Math.min(round, config.rounds)}</span>
            <span className="text-3xl opacity-70">/{config.rounds}</span>
          </div>
          <button
            onClick={phase === 'done' ? handleReset : handleStop}
            aria-label={phase === 'done' ? 'Cerrar' : 'Cortar el timer'}
            className="w-14 h-14 rounded-full bg-black/25 hover:bg-black/40 flex items-center justify-center cursor-pointer"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Centro: el reloj ocupa la pantalla; tocar pausa o sigue */}
        <button
          onClick={phase === 'done' ? handleReset : handleStartPause}
          className="flex-1 flex flex-col items-center justify-center px-4 cursor-pointer"
          aria-label={phase === 'done' ? 'Listo' : running ? 'Pausar' : 'Seguir'}
        >
          <span className="font-display font-bold uppercase tracking-[0.08em] text-[clamp(1.5rem,min(8vw,8vh),3.5rem)] leading-none">
            {label}
          </span>
          <span
            className="font-display font-extrabold leading-[0.82] tabular mt-2"
            style={{ fontSize: clock.length > 4 ? 'min(38vw, 44vh)' : 'min(48vw, 50vh)' }}
          >
            {clock}
          </span>
          <span className="mt-[min(1rem,2vh)] text-base font-semibold opacity-85 h-6">
            {phase === 'done'
              ? `${config.rounds} rounds completos · tocá para cerrar`
              : paused
              ? 'En pausa · tocá para seguir'
              : phase === 'rest'
              ? `Sigue el round ${round + 1}`
              : 'Tocá para pausar'}
          </span>
        </button>

        {/* Abajo: rounds y saltar */}
        <div className="safe-bottom px-5 pb-4 flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5 max-w-[70%]" aria-hidden="true">
            {Array.from({ length: config.rounds }).map((_, i) => {
              const n = i + 1;
              const done = n < round || (n === round && (phase === 'rest' || phase === 'done'));
              const current = n === round && phase === 'round';
              return (
                <span
                  key={i}
                  className={`h-3 rounded-full ${current ? 'w-7 bg-white' : done ? 'w-3 bg-white' : 'w-3 bg-black/30'}`}
                />
              );
            })}
          </div>
          {phase !== 'done' && (
            <button
              onClick={handleSkip}
              aria-label="Saltar a la siguiente fase"
              className="h-14 px-5 rounded-full bg-black/25 hover:bg-black/40 flex items-center gap-2 font-semibold cursor-pointer"
            >
              <SkipForward className="w-5 h-5" /> Saltar
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---------- Configuración (antes de empezar) ----------
  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-end justify-between">
        <h1 className="font-display font-extrabold uppercase text-3xl tracking-tight leading-none">Timer</h1>
        <span className="text-sm text-zinc-400 flex items-center gap-1.5">
          <Volume2 className="w-4 h-4" /> Sacá el modo silencio
        </span>
      </div>

      <button
        onClick={handleStartPause}
        className="w-full rounded-2xl bg-ring-red hover:bg-ring-red-deep active:scale-[0.99] text-white px-5 py-5 flex items-center justify-between cursor-pointer transition-colors"
      >
        <span className="text-left">
          <span className="block font-display font-extrabold uppercase text-4xl leading-none tracking-tight">Empezar</span>
          <span className="block text-sm font-semibold mt-1.5 opacity-90 tabular">
            {config.rounds} × {mmss(config.roundSec)}{config.restSec ? ` · descanso ${mmss(config.restSec)}` : ''} · total {mmss(totalTime)}
          </span>
        </span>
        <span className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center shrink-0">
          <Play className="w-8 h-8 ml-1" fill="currentColor" />
        </span>
      </button>

      <section aria-labelledby="presets-title">
        <h2 id="presets-title" className="text-sm font-semibold text-zinc-400 mb-2">Elegí el tipo</h2>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map(p => {
            const on = activePreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setConfig(p.config)}
                aria-pressed={on}
                className={`min-h-16 text-left px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                  on ? 'bg-zinc-900 border-ring-red' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <span className={`block font-display font-bold uppercase text-lg leading-none ${on ? 'text-white' : 'text-zinc-200'}`}>{p.label}</span>
                <span className="block text-sm text-zinc-400 mt-1 tabular">{p.detail}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="ajustes-title" className="border-t border-zinc-800">
        <h2 id="ajustes-title" className="sr-only">Ajustar</h2>
        <div className="divide-y divide-zinc-800">
          <Stepper
            label="Rounds"
            value={String(config.rounds)}
            onMinus={() => setCfg({ rounds: Math.max(1, config.rounds - 1) })}
            onPlus={() => setCfg({ rounds: Math.min(30, config.rounds + 1) })}
          />
          <Stepper
            label="Duración del round"
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
            value={config.warnSec ? `${config.warnSec}s` : 'No'}
            onMinus={() => setCfg({ warnSec: Math.max(0, config.warnSec - 5) })}
            onPlus={() => setCfg({ warnSec: Math.min(30, config.warnSec + 5) })}
          />
        </div>
      </section>

      <button
        onClick={() => { getCtx(); bell(1); }}
        className="w-full h-12 text-sm font-semibold text-zinc-300 border border-zinc-800 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:text-white"
      >
        <Bell className="w-4 h-4" /> Probar la campana
      </button>
      <p className="text-sm text-zinc-500 text-center">
        Al empezar, la pantalla entera se vuelve el reloj: rojo en el round, verde en el descanso, ámbar en los últimos segundos.
      </p>
    </div>
  );
};
