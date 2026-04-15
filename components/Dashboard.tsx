'use client';

import { useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import FolderCard from './FolderCard';
import { Plus, GraduationCap, LayoutGrid, Loader2, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { folders, loading, createFolder } = useDashboard();
  const [isAdding, setIsAdding] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName);
    setNewFolderName('');
    setIsAdding(false);
  };

  const totalDue = folders.reduce((acc, folder) => acc + folder.dueCount, 0);

  if (loading && folders.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-accent mb-4" size={32} />
        <p className="text-muted">Cargando tu vocabulario...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-8 py-8">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Mis Repasos</h1>
        <p className="text-muted">Desarrolla tu fluidez palabra a palabra.</p>
      </header>

      {/* Hero Action */}
      <div className="relative overflow-hidden glass p-6 border-accent/20 bg-gradient-to-br from-accent/10 to-transparent">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-1">Repaso General</h2>
          <p className="text-sm text-muted mb-4">
            {totalDue > 0 
              ? `Tienes ${totalDue} palabras listas para repasar hoy.` 
              : '¡Felicidades! Estás al día con todo tu vocabulario.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/study/all"
              className={`inline-flex items-center gap-2 py-3 px-6 rounded-xl font-bold transition-all ${
                totalDue > 0 
                  ? 'bg-accent text-white shadow-lg shadow-accent/20 hover:scale-105' 
                  : 'bg-white/5 text-muted pointer-events-none'
              }`}
            >
              <GraduationCap size={20} />
              Estudiar Pendientes
            </Link>
            <Link 
              href="/study/all?mode=free"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-bold bg-white/5 text-foreground border border-white/10 hover:bg-white/10 transition-all hover:scale-105"
            >
              <Zap size={20} className="text-orange-400 fill-orange-400" />
              Repaso Libre
            </Link>
          </div>
        </div>
        <GraduationCap className="absolute -right-4 -bottom-4 text-accent/5 rotate-12" size={140} />
      </div>

      {/* Folders Section */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-muted font-medium">
            <LayoutGrid size={18} />
            <h2>Carpetas</h2>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleCreate} className="glass p-4 border-accent animate-fade-in mb-2">
            <input 
              autoFocus
              className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted mb-4 text-lg font-bold"
              placeholder="Nombre de la carpeta..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <div className="flex gap-2">
              <button 
                type="submit"
                className="flex-1 py-2 bg-accent text-white rounded-lg font-medium"
              >
                Crear
              </button>
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-white/5 text-muted rounded-lg font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {folders.map(folder => (
            <FolderCard 
              key={folder.id}
              id={folder.id}
              name={folder.name}
              cardCount={folder.cardCount}
              dueCount={folder.dueCount}
            />
          ))}
          
          {folders.length === 0 && !isAdding && (
             <div 
               onClick={() => setIsAdding(true)}
               className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent/50 group transition-colors"
             >
               <Plus className="text-muted group-hover:text-accent mb-2 transition-colors" size={32} />
               <p className="text-muted">Crea tu primera carpeta para empezar</p>
             </div>
          )}
        </div>
      </section>
    </div>
  );
}
