import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, ClientLevel, ClientGoal } from '../../types';
import { X } from 'lucide-react';

interface ClientModalProps {
  clientToEdit?: Client;
  onClose: () => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({ clientToEdit, onClose }) => {
  const { packages, profile, addClient, updateClient } = useApp();

  const [name, setName] = useState(clientToEdit ? clientToEdit.name : '');
  const [phone, setPhone] = useState(clientToEdit ? clientToEdit.phone : '');
  const [whatsapp, setWhatsapp] = useState(clientToEdit ? (clientToEdit.whatsapp || '') : '');
  const [email, setEmail] = useState(clientToEdit ? (clientToEdit.email || '') : '');
  const [level, setLevel] = useState<ClientLevel>(clientToEdit ? clientToEdit.level : 'principiante');
  const [goal, setGoal] = useState<ClientGoal>(clientToEdit ? clientToEdit.goal : 'tecnica');
  const [packageId, setPackageId] = useState(clientToEdit ? (clientToEdit.packageId || '') : '');
  const [notes, setNotes] = useState(clientToEdit ? (clientToEdit.notes || '') : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const selectedPkg = packages.find(p => p.id === packageId);

    if (clientToEdit) {
      updateClient(clientToEdit.id, {
        name,
        phone,
        whatsapp: whatsapp || phone.replace(/[^0-9]/g, ''),
        email,
        level,
        goal,
        packageId: packageId || undefined,
        notes
      });
    } else {
      addClient({
        name,
        phone,
        whatsapp: whatsapp || phone.replace(/[^0-9]/g, ''),
        email,
        level,
        goal,
        packageId: packageId || undefined,
        sessionsRemaining: selectedPkg ? selectedPkg.sessionCount : 0,
        notes
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-zinc-950 px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-bold text-white tracking-tight">
            {clientToEdit ? 'Editar Datos del Cliente' : 'Registrar Nuevo alumno'}
          </h2>
          <button
            onClick={onClose}
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre Completo del Cliente</label>
            <input
              type="text"
              required
              placeholder="Ej. Roberto Juárez"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-ring-red"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Teléfono</label>
              <input
                type="tel"
                placeholder="11 2345-6789"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">WhatsApp (número directo)</label>
              <input
                type="text"
                placeholder="Si es distinto al teléfono"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Opcional</label>
            <input
              type="email"
              placeholder="nombre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Nivel de Boxeo</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value as ClientLevel)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
              >
                <option value="principiante">🌱 Principiante</option>
                <option value="intermedio">⚡ Intermedio</option>
                <option value="avanzado">🔥 Avanzado</option>
                <option value="competidor">🥊 Competidor / Peleador</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Objetivo Principal</label>
              <select
                value={goal}
                onChange={e => setGoal(e.target.value as ClientGoal)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
              >
                <option value="tecnica">🎯 Perfeccionar Técnica</option>
                <option value="perder_peso">🔥 Bajar de Peso / Quemar Grasa</option>
                <option value="condicion_fisica">💪 Condición Física de Boxeador</option>
                <option value="competencia">🏆 Competir en Ring</option>
                <option value="defensa_personal">🛡️ Defensa Personal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Paquete / Servicio Asignado</label>
            <select
              value={packageId}
              onChange={e => setPackageId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
            >
              <option value="">-- Sin paquete asignado --</option>
              {packages.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({profile.currencySymbol}{p.price} - {p.sessionCount} sesiones)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Notas Internas</label>
            <textarea
              rows={2}
              placeholder="Lesiones, observaciones de guardia..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 min-h-11 rounded-xl bg-zinc-900 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg transition-all cursor-pointer border border-ring-red/40"
          >
            {clientToEdit ? 'Guardar Cambios' : 'Registrar Cliente'}
          </button>
        </form>

      </div>
    </div>
  );
};
