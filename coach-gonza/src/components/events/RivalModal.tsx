import { askConfirm } from '../../utils/confirm';
import React, { useState } from 'react';
import { X, Save, Search, Youtube, Instagram, Newspaper, Star, Trash2, Lightbulb, ClipboardCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FightEvent, Rival, Stance } from '../../types';
import { buildFightPlan, planToText, AREA_LABEL } from '../../utils/fightPlan';

export const STYLE_TAGS = [
  'Presionador',
  'Contragolpeador',
  'Boxeador de distancia',
  'Pegador',
  'Mucho volumen',
  'Buen jab',
  'Trabaja abajo',
  'Se cubre bien',
  'Buenas piernas',
  'Cansa rápido'
];

export const STANCE_LABEL: Record<Stance, string> = {
  ortodoxo: 'Diestro (ortodoxo)',
  zurdo: 'Zurdo',
  cambia: 'Cambia de guardia'
};

export const recordText = (r: Rival) => {
  if (r.wins === undefined && r.losses === undefined && r.draws === undefined) return '';
  const base = `${r.wins ?? 0}-${r.losses ?? 0}-${r.draws ?? 0}`;
  return r.kos ? `${base} (${r.kos} KO)` : base;
};

// Búsquedas listas con el nombre del rival (se abren en el navegador)
export const searchLinks = (r: Rival) => {
  const q = [r.name, r.nickname ? `"${r.nickname}"` : ''].filter(Boolean).join(' ');
  const enc = (s: string) => encodeURIComponent(s.trim());
  return {
    boxrec: `https://www.google.com/search?q=${enc(`site:boxrec.com ${r.name}`)}`,
    youtube: `https://www.youtube.com/results?search_query=${enc(`${q} boxeo`)}`,
    instagram: `https://www.google.com/search?q=${enc(`site:instagram.com ${r.name} boxeo`)}`,
    news: `https://www.google.com/search?tbm=nws&q=${enc(`"${r.name}" boxeo ${r.city || ''}`)}`
  };
};

const inputCls =
  'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red';
const labelCls = 'block text-[12.5px] font-semibold text-zinc-300 mb-1';

const num = (v: string) => {
  const n = Number(v.replace(',', '.'));
  return v.trim() === '' || isNaN(n) ? undefined : n;
};

interface Props {
  event: FightEvent;
  onClose: () => void;
}

export const RivalModal: React.FC<Props> = ({ event, onClose }) => {
  const { updateEvent } = useApp();
  const r = event.rival;

  const [name, setName] = useState(r?.name ?? '');
  const [nickname, setNickname] = useState(r?.nickname ?? '');
  const [wins, setWins] = useState(r?.wins !== undefined ? String(r.wins) : '');
  const [losses, setLosses] = useState(r?.losses !== undefined ? String(r.losses) : '');
  const [draws, setDraws] = useState(r?.draws !== undefined ? String(r.draws) : '');
  const [kos, setKos] = useState(r?.kos !== undefined ? String(r.kos) : '');
  const [gym, setGym] = useState(r?.gym ?? '');
  const [city, setCity] = useState(r?.city ?? '');
  const [stance, setStance] = useState<Stance | ''>(r?.stance ?? '');
  const [age, setAge] = useState(r?.age !== undefined ? String(r.age) : '');
  const [height, setHeight] = useState(r?.height !== undefined ? String(r.height) : '');
  const [level, setLevel] = useState(r?.level ?? 0);
  const [styles, setStyles] = useState<string[]>(r?.styles ?? []);
  const [strengths, setStrengths] = useState(r?.strengths ?? '');
  const [weaknesses, setWeaknesses] = useState(r?.weaknesses ?? '');
  const [notes, setNotes] = useState(r?.notes ?? '');
  const [boxrecUrl, setBoxrecUrl] = useState(r?.boxrecUrl ?? '');
  const [videoUrl, setVideoUrl] = useState(r?.videoUrl ?? '');
  const [instagram, setInstagram] = useState(r?.instagram ?? '');

  const links = name.trim() ? searchLinks({ name, nickname, city }) : null;

  const toggleStyle = (t: string) =>
    setStyles(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));

  const buildRival = (): Rival => ({
    name: name.trim(),
    nickname: nickname.trim() || undefined,
    wins: num(wins),
    losses: num(losses),
    draws: num(draws),
    kos: num(kos),
    gym: gym.trim() || undefined,
    city: city.trim() || undefined,
    stance: stance || undefined,
    age: num(age),
    height: num(height),
    level: level || undefined,
    styles: styles.length ? styles : undefined,
    strengths: strengths.trim() || undefined,
    weaknesses: weaknesses.trim() || undefined,
    notes: notes.trim() || undefined,
    boxrecUrl: boxrecUrl.trim() || undefined,
    videoUrl: videoUrl.trim() || undefined,
    instagram: instagram.trim() || undefined
  });

  const plan = buildFightPlan(buildRival());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateEvent(event.id, { rival: buildRival() });
    onClose();
  };

  const handleSaveWithPlan = () => {
    if (!name.trim()) return;
    const rival = buildRival();
    const text = planToText(rival, plan);
    const cornerNotes = event.cornerNotes ? `${event.cornerNotes}\n\n${text}` : text;
    updateEvent(event.id, { rival, cornerNotes });
    onClose();
  };

  const handleDelete = async () => {
    if (await askConfirm('¿Borrar la ficha del rival?', { okLabel: 'Borrar' })) {
      updateEvent(event.id, { rival: undefined });
      onClose();
    }
  };

  const searchBtn = 'flex items-center justify-center gap-1.5 text-sm font-bold min-h-11 rounded-xl border';

  return (
    <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center bg-black/80 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-t-3xl sm:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl sm:my-6 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between bg-zinc-950 px-5 py-4 border-b border-zinc-800">
          <div className="min-w-0">
            <h2 className="font-display font-extrabold uppercase text-2xl leading-none tracking-tight text-white">Ficha del rival</h2>
            <p className="text-[12.5px] text-zinc-400 truncate">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-11 h-11 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 pb-8 space-y-4 overflow-y-auto safe-bottom">
          {/* Identidad */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className={labelCls}>Nombre y apellido *</label>
              <input required value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Juan Ramírez" className={inputCls} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className={labelCls}>Apodo</label>
              <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Ej. El Tanque" className={inputCls} />
            </div>
          </div>

          {/* Búsquedas rápidas */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
            <p className="text-[12.5px] font-bold text-zinc-300">
              Investigar al rival {links ? '' : '(escribí el nombre primero)'}
            </p>
            <div className={`grid grid-cols-2 gap-2 ${links ? '' : 'opacity-40 pointer-events-none'}`}>
              <a href={links?.boxrec} target="_blank" rel="noopener noreferrer" className={`${searchBtn} bg-zinc-800 border-zinc-700 text-white`}>
                <Search className="w-3.5 h-3.5" /> Récord en BoxRec
              </a>
              <a href={links?.youtube} target="_blank" rel="noopener noreferrer" className={`${searchBtn} bg-zinc-800 border-zinc-700 text-white`}>
                <Youtube className="w-3.5 h-3.5" /> Videos de peleas
              </a>
              <a href={links?.instagram} target="_blank" rel="noopener noreferrer" className={`${searchBtn} bg-zinc-800 border-zinc-700 text-white`}>
                <Instagram className="w-3.5 h-3.5" /> Instagram
              </a>
              <a href={links?.news} target="_blank" rel="noopener noreferrer" className={`${searchBtn} bg-zinc-800 border-zinc-700 text-white`}>
                <Newspaper className="w-3.5 h-3.5" /> Noticias
              </a>
            </div>
            <p className="text-xs text-zinc-500 leading-snug">
              Se abren con el nombre ya buscado. Lo que encuentres lo anotás acá abajo y queda guardado.
            </p>
          </div>

          {/* Récord */}
          <div>
            <label className={labelCls}>Récord</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                ['Ganadas', wins, setWins],
                ['Perdidas', losses, setLosses],
                ['Empates', draws, setDraws],
                ['Por KO', kos, setKos]
              ].map(([lbl, val, set]) => (
                <div key={lbl as string}>
                  <input
                    inputMode="numeric"
                    value={val as string}
                    onChange={e => (set as (v: string) => void)(e.target.value.replace(/\D/g, ''))}
                    placeholder="0"
                    className={`${inputCls} text-center`}
                  />
                  <span className="block text-xs text-zinc-500 text-center mt-0.5">{lbl as string}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dónde entrena */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Club / gimnasio</label>
              <input value={gym} onChange={e => setGym(e.target.value)} placeholder="Dónde entrena" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Ciudad</label>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Ej. Rosario" className={inputCls} />
            </div>
          </div>

          {/* Físico */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 sm:col-span-1">
              <label className={labelCls}>Guardia</label>
              <select value={stance} onChange={e => setStance(e.target.value as Stance | '')} className={inputCls}>
                <option value="">No sé</option>
                <option value="ortodoxo">Diestro</option>
                <option value="zurdo">Zurdo</option>
                <option value="cambia">Cambia</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Edad</label>
              <input inputMode="numeric" value={age} onChange={e => setAge(e.target.value.replace(/\D/g, ''))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Altura (cm)</label>
              <input inputMode="numeric" value={height} onChange={e => setHeight(e.target.value.replace(/\D/g, ''))} className={inputCls} />
            </div>
          </div>

          {/* Calidad */}
          <div>
            <label className={labelCls}>Calidad / nivel estimado</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setLevel(level === n ? 0 : n)}
                  aria-label={`${n} estrellas`}
                  className="p-1 cursor-pointer"
                >
                  <Star className={`w-6 h-6 ${n <= level ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`} />
                </button>
              ))}
              <span className="text-[12.5px] text-zinc-400 ml-1">
                {['Sin evaluar', 'Principiante', 'Regular', 'Bueno', 'Muy bueno', 'Peligroso'][level]}
              </span>
            </div>
          </div>

          {/* Estilo */}
          <div>
            <label className={labelCls}>Estilo</label>
            <div className="flex flex-wrap gap-1.5">
              {STYLE_TAGS.map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggleStyle(t)}
                  className={`text-sm font-semibold px-3 min-h-11 rounded-xl border cursor-pointer ${
                    styles.includes(t) ? 'bg-ring-red border-ring-red text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className={labelCls}>💪 Puntos fuertes</label>
              <textarea rows={2} value={strengths} onChange={e => setStrengths(e.target.value)} placeholder="Ej. Mano derecha pesada, mucho aire" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>🎯 Puntos débiles</label>
              <textarea rows={2} value={weaknesses} onChange={e => setWeaknesses(e.target.value)} placeholder="Ej. Baja la izquierda al tirar el cross" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Notas</label>
              <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Últimas peleas, quién lo entrena, cómo dio el peso…" className={inputCls} />
            </div>
          </div>

          {/* Plan sugerido */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
            <p className="font-display font-bold uppercase text-lg text-ring-red flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" /> Cómo pelearle (sugerido)
            </p>
            {plan.length === 0 ? (
              <p className="text-[12.5px] text-zinc-400">
                Completá guardia, estilo, altura o récord y acá aparecen las sugerencias para la esquina.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {plan.map((t, i) => (
                  <li key={i} className="text-sm text-zinc-200 leading-snug flex gap-1.5">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-ring-red mt-2" />
                    <span>
                      <span className="font-bold text-white">{AREA_LABEL[t.area].label}:</span> {t.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-zinc-500">Pautas generales según la ficha. El plan final lo decidís vos.</p>
          </div>

          {/* Links guardados */}
          <div className="space-y-2">
            <label className={labelCls}>Links que encontraste (opcional)</label>
            <input value={boxrecUrl} onChange={e => setBoxrecUrl(e.target.value)} placeholder="Link de BoxRec" className={inputCls} />
            <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="Link de un video de pelea" className={inputCls} />
            <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="Instagram (link o @usuario)" className={inputCls} />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 bg-ring-red hover:bg-ring-red-deep text-white font-bold text-sm min-h-12 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Guardar ficha
            </button>
            {plan.length > 0 && (
              <button
                type="button"
                onClick={handleSaveWithPlan}
                title="Guarda la ficha y suma el plan a la estrategia de esquina"
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-sm min-h-12 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ClipboardCheck className="w-4 h-4" /> Guardar + pasar a la esquina
              </button>
            )}
            {r && (
              <button
                type="button"
                onClick={handleDelete}
                aria-label="Borrar ficha"
                className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-red-300 flex items-center justify-center cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
