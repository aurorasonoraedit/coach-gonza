import { askConfirm } from '../../utils/confirm';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, Plus, Edit3, Trash2, Check, Sparkles } from 'lucide-react';
import { PackageService } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';
import { PackageModal } from './PackageModal';

export const PackagesView: React.FC = () => {
  const { packages, profile, deletePackage } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [pkgToEdit, setPkgToEdit] = useState<PackageService | null>(null);

  const handleDelete = async (id: string) => {
    if (await askConfirm('¿Eliminar este paquete?', { okLabel: 'Eliminar' })) {
      deletePackage(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold uppercase text-3xl tracking-tight leading-none">Tarifas & Paquetes de Entrenamiento ({packages.length})
          </h2>
          <p className="text-sm text-zinc-400 mt-1.5">
            Tus precios por clase, packs y mensualidades.
          </p>
        </div>

        <button
          onClick={() => {
            setPkgToEdit(null);
            setModalOpen(true);
          }}
          className="bg-ring-red hover:bg-ring-red-deep text-white text-xs font-bold px-3.5 py-2.5 min-h-11 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer border border-ring-red/40"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Paquete</span>
        </button>
      </div>

      {/* Grid of Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map(pkg => {
          const perSessionPrice = Math.round(pkg.price / (pkg.sessionCount || 1));

          return (
            <div
              key={pkg.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-800/60 px-2 py-0.5 rounded">
                      {pkg.category}
                    </span>
                    <h3 className="text-base font-black text-white mt-1.5 leading-snug">{pkg.name}</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-white block">
                      {formatCurrency(pkg.price, profile.currencySymbol)}
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold block">
                      ~{formatCurrency(perSessionPrice, profile.currencySymbol)} / sesión
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 border border-zinc-800/80 rounded-xl p-3">
                  {pkg.description || 'Sin descripción'}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-center">
                    <span className="text-zinc-500 text-xs block">Sesiones Incluidas</span>
                    <span className="text-white font-extrabold">{pkg.sessionCount} turnos</span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-center">
                    <span className="text-zinc-500 text-xs block">Vigencia</span>
                    <span className="text-white font-extrabold">{pkg.validityDays || 30} días</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="border-t border-zinc-800/80 pt-3 flex items-center justify-end space-x-2">
                <button
                  onClick={() => {
                    setPkgToEdit(pkg);
                    setModalOpen(true);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold px-3 py-2 min-h-11 rounded-lg border border-zinc-700 transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-red-300 text-xs font-bold px-3 py-2 min-h-11 rounded-lg border border-zinc-700 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <PackageModal
          packageToEdit={pkgToEdit || undefined}
          onClose={() => {
            setModalOpen(false);
            setPkgToEdit(null);
          }}
        />
      )}

    </div>
  );
};
