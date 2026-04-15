'use client';

import { Folder, Play, Plus, Zap } from 'lucide-react';
import Link from 'next/link';

interface FolderProps {
  id: string;
  name: string;
  cardCount: number;
  dueCount: number;
}

export default function FolderCard({ id, name, cardCount, dueCount }: FolderProps) {
  return (
    <div className="glass p-5 flex flex-col gap-4 group hover:border-accent/50 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-accent/10 rounded-xl text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-300">
          <Folder size={24} />
        </div>
        {dueCount > 0 && (
          <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-1 rounded-full border border-orange-500/20">
            {dueCount} pendientes
          </span>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold text-foreground mb-1">{name}</h3>
        <p className="text-muted text-sm">{cardCount} tarjetas en total</p>
      </div>

      <div className="flex gap-2 mt-2">
        <Link 
          href={`/study/${id}`}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
          title="Estudiar pendientes (SRS)"
        >
          <Play size={16} fill="currentColor" />
          Estudiar
        </Link>
        <Link 
          href={`/study/${id}?mode=free`}
          className="p-2 border border-border rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-orange-400"
          title="Modo Libre (Repasar todo)"
        >
          <Zap size={20} />
        </Link>
        <Link 
          href={`/folder/${id}`}
          className="p-2 border border-border rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-foreground"
        >
          <Plus size={20} />
        </Link>
      </div>
    </div>
  );
}
