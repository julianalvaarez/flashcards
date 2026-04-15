'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function FolderDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [folder, setFolder] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    word: '',
    meaning_es: '',
    meaning_en: '',
    example: ''
  });

  const fetchFolderData = async () => {
    try {
      setLoading(true);
      const { data: folderData } = await supabase
        .from('folders')
        .select('*')
        .eq('id', id)
        .single();
      
      setFolder(folderData);

      const { data: cardsData } = await supabase
        .from('cards')
        .select('*')
        .eq('folder_id', id)
        .order('created_at', { ascending: false });

      setCards(cardsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolderData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('cards')
      .insert([{
        ...formData,
        folder_id: id,
        user_id: user.id
      }]);

    if (!error) {
      setFormData({ word: '', meaning_es: '', meaning_en: '', example: '' });
      setIsAdding(false);
      fetchFolderData();
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarjeta?')) return;
    const { error } = await supabase.from('cards').delete().eq('id', cardId);
    if (!error) fetchFolderData();
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="py-8 animate-fade-in">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted hover:text-foreground">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{folder?.name}</h1>
          <p className="text-sm text-muted">{cards.length} tarjetas</p>
        </div>
      </header>

      {/* Add Card Button / Form */}
      {!isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-4 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-muted hover:text-accent hover:border-accent/50 transition-all group mb-8"
        >
          <Plus size={20} className="group-hover:scale-110 transition-transform" />
          Añadir Palabra
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="glass p-6 mb-8 border-accent/20 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-accent">Nueva Tarjeta</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-muted hover:text-foreground">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted block mb-1">Palabra (Inglés)</label>
              <input 
                required
                className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-3 outline-none focus:border-accent transition-colors"
                placeholder="Ex: Ubiquitous"
                value={formData.word}
                onChange={e => setFormData({ ...formData, word: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted block mb-1">Significado (Español)</label>
              <input 
                required
                className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-3 outline-none focus:border-accent transition-colors"
                placeholder="Ex: Ubicuo / Omnipresente"
                value={formData.meaning_es}
                onChange={e => setFormData({ ...formData, meaning_es: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted block mb-1">Definición (Opcional)</label>
              <input 
                className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-3 outline-none focus:border-accent transition-colors"
                placeholder="Ex: Present, appearing, or found everywhere."
                value={formData.meaning_en}
                onChange={e => setFormData({ ...formData, meaning_en: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted block mb-1">Ejemplo (Opcional)</label>
              <textarea 
                className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-3 outline-none focus:border-accent transition-colors min-h-[100px]"
                placeholder="Ex: Fast food restaurants are ubiquitous in this city."
                value={formData.example}
                onChange={e => setFormData({ ...formData, example: e.target.value })}
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all active:scale-95"
            >
              Guardar Tarjeta
            </button>
          </div>
        </form>
      )}

      {/* Cards List */}
      <div className="space-y-3">
        {cards.map(card => (
          <div key={card.id} className="glass p-4 flex justify-between items-center group hover:border-white/20 transition-all">
            <div>
              <h4 className="font-bold text-lg">{card.word}</h4>
              <p className="text-accent text-sm">{card.meaning_es}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => deleteCard(card.id)}
                className="p-2 text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {cards.length === 0 && !isAdding && (
          <div className="text-center py-10">
            <p className="text-muted">Aún no hay tarjetas en esta carpeta.</p>
          </div>
        )}
      </div>
    </div>
  );
}
