'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import StudySession from '@/components/StudySession';
import { Loader2, ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';

export default function FolderStudy() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isFreeMode = searchParams.get('mode') === 'free';
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const now = new Date().toISOString();
        
        let query = supabase.from('cards').select('*');
        
        if (id !== 'all') {
          query = query.eq('folder_id', id);
        }

        // Only cards due for review, UNLESS in free mode
        if (!isFreeMode) {
          query = query.lte('next_review', now);
        }

        const { data, error } = await query
          .order('next_review', { ascending: true });

        if (error) throw error;
        setCards(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [id, isFreeMode]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-accent" size={32} />
        <p className="mt-4 text-muted">Preparando sesión...</p>
      </div>
    );
  }

  return (
    <div className="py-8 animate-fade-in flex flex-col h-full">
      <header className="flex items-center gap-4 mb-10">
        <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted hover:text-foreground">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {isFreeMode && <Zap size={20} className="text-orange-400 fill-orange-400" />}
            {id === 'all' ? 'Repaso General' : 'Sesión de Carpeta'}
          </h1>
          {isFreeMode && <span className="text-xs text-orange-400 font-bold uppercase tracking-widest">Modo Libre</span>}
        </div>
      </header>

      {cards.length > 0 ? (
        <StudySession cards={cards} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-muted">
             <CheckCircleIcon size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Todo al día!</h2>
          <p className="text-muted mb-8">No tienes tarjetas pendientes de repaso en esta sección.</p>
          <Link href="/" className="bg-accent text-white px-8 py-3 rounded-xl font-bold">
            Volver al Inicio
          </Link>
        </div>
      )}
    </div>
  );
}

function CheckCircleIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
