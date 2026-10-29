import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PackageService } from '../../types';
import { X } from 'lucide-react';

interface PackageModalProps {
  packageToEdit?: PackageService;
  onClose: () => void;
}

export const PackageModal: React.FC<PackageModalProps> = ({ packageToEdit, onClose }) => {
  const { profile, addPackage, updatePackage } = useApp();

  const [name, setName] = useState(packageToEdit ? packageToEdit.name : '');
  const [price, setPrice] = useState<number>(packageToEdit ? packageToEdit.price : 100);
  const [sessionCount, setSessionCount] = useState<number>(packageToEdit ? packageToEdit.sessionCount : 8);
  const [validityDays, setValidityDays] = useState<number>(packageToEdit ? (packageToEdit.validityDays || 30) : 30);
  const [description, setDescription] = useState(packageToEdit ? packageToEdit.description : '');
  const [category, setCategory] = useState<'individual' | 'paquete' | 'mensualidad' | 'especial'>(
    packageToEdit ? packageToEdit.category : 'paquete'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    if (packageToEdit) {
      updatePackage(packageToEdit.id, {
        name,
        price: Number(price),
        sessionCount: Number(sessionCount),
        validityDays: Number(validityDays),
        description,
        category
      });
    } else {
      addPackage({
        name,
        price: Number(price),
        sessionCount: Number(sessionCount),
        validityDays: Number(validityDays),
        description,
        category
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
            {packageToEdit ? 'Editar Paquete / Tarifa' : 'Crear Nuevo Paquete o Servicio'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre del Servicio / Paquete</label>
            <input
              type="text"
              required
              placeholder="Ej. Paquete Campeón (8 Sesiones)"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Precio Total ({profile.currencySymbol})</label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Número de Sesiones</label>
              <input
                type="number"
                required
                min="1"
                value={sessionCount}
                onChange={e => setSessionCount(Number(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Categoría</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
              >
                <option value="individual">Clase Individual</option>
                <option value="paquete">Paquete de Sesiones</option>
                <option value="mensualidad">Mensualidad Grupal</option>
                <option value="especial">Especial / Campamento Pelea</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Vigencia (días)</label>
              <input
                type="number"
                min="1"
                value={validityDays}
                onChange={e => setValidityDays(Number(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Descripción de lo que incluye</label>
            <textarea
              rows={2}
              placeholder="Ej. Incluye manopleo pro, rutina de cardio y plan de hidratación..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg transition-all cursor-pointer border border-red-500/40"
          >
            {packageToEdit ? 'Guardar Cambios' : 'Crear Paquete'}
          </button>
        </form>

      </div>
    </div>
  );
};
