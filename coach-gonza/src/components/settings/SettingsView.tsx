import { askConfirm } from '../../utils/confirm';
import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, RotateCcw, Download, Upload, Trash2 } from 'lucide-react';
import { exportSessionsToCSV, exportIncomesToCSV, exportClientsToCSV } from '../../utils/exportUtils';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    sessions,
    incomes,
    clients,
    resetToInitialData,
    clearAllData,
    restoreBackup,
    buildBackup,
    showToast
  } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile.name);
  const [nickname, setNickname] = useState(profile.nickname || '');
  const [handle, setHandle] = useState(profile.handle || '@palma_gon');
  const [gymName, setGymName] = useState(profile.gymName);
  const [coTrainer, setCoTrainer] = useState(profile.coTrainer || '');
  const [philosophy, setPhilosophy] = useState(profile.philosophy || 'Reforzando la muralla: Disciplina, Sparring, Acondicionamiento Riguroso y Técnica de Combate');
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [currencySymbol, setCurrencySymbol] = useState(profile.currencySymbol);
  const [defaultSessionDurationMinutes, setDefaultSessionDurationMinutes] = useState(profile.defaultSessionDurationMinutes);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      ...profile,
      name,
      nickname: nickname.trim() || undefined,
      handle,
      gymName,
      coTrainer,
      philosophy,
      phone,
      email,
      currencySymbol,
      defaultSessionDurationMinutes: Number(defaultSessionDurationMinutes)
    });
  };

  const handleBackupExportJSON = async () => {
    const jsonStr = JSON.stringify(buildBackup(), null, 2);
    const filename = `BoxCoach_Copia_${new Date().toISOString().slice(0, 10)}.json`;
    const file = new File([jsonStr], filename, { type: 'application/json' });

    // En iPhone/Android abre el menú "Compartir" (guardar en Archivos, WhatsApp, Drive…)
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare && nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: 'Copia de seguridad BoxCoach' });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!(await askConfirm('Esto reemplaza todos los datos actuales por los de la copia. ¿Continuar?', { okLabel: 'Restaurar' }))) return;
      if (!restoreBackup(data)) showToast('Ese archivo no es una copia válida de BoxCoach');
    } catch {
      showToast('No se pudo leer el archivo');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="">
        <h2 className="font-display font-extrabold uppercase text-3xl tracking-tight leading-none">Configuración & Respaldo
        </h2>
        <p className="text-sm text-zinc-400 mt-1.5">
          Tu perfil, tus datos y la copia de seguridad.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Form (2 Cols) */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-white">Perfil del Entrenador</h3>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Apodo (así te saluda la app)</label>
              <input
                type="text"
                placeholder="Ej. Gonza, Palma, Profe…"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Nombre del Coach</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Usuario / Redes Social</label>
                <input
                  type="text"
                  placeholder="@palma_gon"
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red text-red-400 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Club / Gimnasio / Descripción</label>
                <input
                  type="text"
                  required
                  value={gymName}
                  onChange={e => setGymName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Equipo (opcional)</label>
                <input
                  type="text"
                  placeholder="Dejar vacío si trabajás solo"
                  value={coTrainer}
                  onChange={e => setCoTrainer(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Filosofía de Entrenamiento</label>
              <input
                type="text"
                placeholder="Reforzando la muralla: Disciplina, Sparring..."
                value={philosophy}
                onChange={e => setPhilosophy(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Teléfono</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Símbolo de Moneda</label>
                <select
                  value={currencySymbol}
                  onChange={e => setCurrencySymbol(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
                >
                  <option value="$">$ (USD / MXN / COP / ARS / CLP)</option>
                  <option value="€">€ (Euro)</option>
                  <option value="S/">S/ (Sol Peruano)</option>
                  <option value="£">£ (Libra Esterlina)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Duración Predeterminada Sesión (min)</label>
                <input
                  type="number"
                  min="30"
                  max="180"
                  value={defaultSessionDurationMinutes}
                  onChange={e => setDefaultSessionDurationMinutes(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-ring-red hover:bg-ring-red-deep text-white font-bold text-xs px-5 py-2.5 min-h-11 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Perfil</span>
            </button>
          </form>
        </div>

        {/* Preferences & Backup (1 Col) */}
        <div className="space-y-4">
          
          {/* Export & Data Backup */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Respaldo de Datos</h3>
            <p className="text-[12.5px] text-zinc-400">
              Guardá una copia completa de tu agenda, alumnos e ingresos para no perder nada.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleBackupExportJSON}
                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-bold py-2.5 min-h-11 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Guardar copia de seguridad</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-bold py-2.5 min-h-11 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-green-400" />
                <span>Restaurar desde una copia</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={handleRestoreFile}
              />

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => exportSessionsToCSV(sessions)}
                  className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[12.5px] font-semibold py-1.5 rounded-lg text-center cursor-pointer"
                >
                  CSV Turnos
                </button>
                <button
                  onClick={() => exportIncomesToCSV(incomes)}
                  className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[12.5px] font-semibold py-1.5 rounded-lg text-center cursor-pointer"
                >
                  CSV Ingresos
                </button>
                <button
                  onClick={() => exportClientsToCSV(clients)}
                  className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[12.5px] font-semibold py-1.5 rounded-lg text-center cursor-pointer"
                >
                  CSV Alumnos
                </button>
              </div>
              <p className="text-xs text-zinc-500 leading-snug">
                Los datos se guardan solo en este teléfono. Hacé una copia cada tanto y guardala en WhatsApp, Drive o Archivos.
              </p>
            </div>
          </div>

          {/* Datos de la app */}
          <div className="bg-zinc-900 border border-red-900/40 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">Datos de la aplicación</h3>
            <p className="text-[12.5px] text-zinc-400">
              Probá la app con datos de ejemplo o borrá todo para empezar de cero. Los paquetes y las rutinas se conservan.
            </p>
            <button
              onClick={async () => {
                if (await askConfirm('Se reemplazan tus datos por datos de ejemplo. ¿Continuar?', { okLabel: 'Cargar ejemplo', danger: false })) resetToInitialData();
              }}
              className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold py-2 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Cargar datos de ejemplo</span>
            </button>
            <button
              onClick={async () => {
                if (await askConfirm('Se borran clientes, turnos, ingresos, gastos, peleas y recordatorios. ¿Seguro?', { okLabel: 'Borrar todo' })) clearAllData();
              }}
              className="w-full bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold py-2 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Borrar todo y empezar de cero</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
