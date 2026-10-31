import React, { useState } from 'react';
import { waBase } from '../../utils/whatsapp';
import { useApp } from '../../context/AppContext';
import { Users, Search, Plus, MessageCircle, Phone, Trophy, Download, Package } from 'lucide-react';
import { Client, ClientLevel } from '../../types';
import { ClientDetailModal } from './ClientDetailModal';
import { ClientModal } from './ClientModal';
import { exportClientsToCSV } from '../../utils/exportUtils';

export const ClientsView: React.FC = () => {
  const { clients, packages } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = selectedLevelFilter === 'all' || c.level === selectedLevelFilter;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display font-extrabold uppercase text-3xl tracking-tight leading-none">Alumnos ({clients.length})
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5">
            Tus alumnos, sus paquetes y cómo contactarlos.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportClientsToCSV(clients)}
            className="min-w-11 min-h-11 inline-flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all border border-zinc-700 cursor-pointer text-xs font-semibold flex items-center space-x-1"
            title="Exportar alumnos a CSV" aria-label="Exportar alumnos a CSV"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="bg-ring-red hover:bg-ring-red-deep text-white text-xs font-bold px-3 py-2.5 min-h-11 rounded-xl flex items-center space-x-1 transition-all cursor-pointer border border-ring-red/40"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo alumno</span>
          </button>
        </div>
      </div>

      {/* Search & Level Chips */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o notas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-ring-red"
          />
        </div>

        {/* Level Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-bold">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'principiante', label: 'Principiantes' },
            { id: 'intermedio', label: 'Intermedios' },
            { id: 'avanzado', label: 'Avanzados' },
            { id: 'competidor', label: 'Competidores' }
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setSelectedLevelFilter(chip.id)}
              className={`px-3 py-2 min-h-11 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                selectedLevelFilter === chip.id
                  ? 'bg-ring-red border-ring-red text-white shadow'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center">
          <Users className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-300">No se encontraron clientes</p>
          <p className="text-xs text-zinc-500 mt-1">Prueba cambiando la búsqueda o crea un nuevo cliente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(c => {
            const pkg = packages.find(p => p.id === c.packageId);

            return (
              <div
                key={c.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-red-950 border border-red-800 text-red-400 font-black text-sm flex items-center justify-center shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm leading-snug">{c.name}</h3>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded">
                            {c.level}
                          </span>
                          <span className="text-xs text-zinc-400 font-medium">
                            • {c.goal.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {c.whatsapp && (
                      <a
                        href={`${waBase(c.whatsapp || c.phone)}?text=${encodeURIComponent(`Hola ${c.name}, te saludo de parte del entrenador.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-11 min-h-11 inline-flex items-center justify-center rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 transition-colors"
                        title="Abrir WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Active Package usage */}
                  {pkg ? (
                    <div className="mt-3 bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5 text-xs space-y-1">
                      <div className="flex justify-between font-medium">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-red-500" /> {pkg.name}
                        </span>
                        <span className="font-bold text-red-400">
                          {c.sessionsRemaining || 0}/{pkg.sessionCount} rest.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-[12.5px] text-zinc-500 italic">
                      Sin paquete activo asignado
                    </div>
                  )}

                  {c.notes && (
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 italic">
                      "{c.notes}"
                    </p>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="border-t border-zinc-800/80 pt-2.5 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium text-[12.5px]">
                    {c.totalSessionsCompleted || 0} sesiones hechas
                  </span>
                  
                  <button
                    onClick={() => setSelectedClient(c)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-3 py-2 min-h-11 rounded-lg border border-zinc-700 transition-all cursor-pointer"
                  >
                    Ver Perfil
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* New Client Modal */}
      {modalOpen && (
        <ClientModal onClose={() => setModalOpen(false)} />
      )}

      {/* Detail Client Modal */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}

    </div>
  );
};
