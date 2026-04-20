'use client';

import { useState } from 'react';
import Flashcard from './ui/Flashcard';
import { calculateNextReview } from '@/lib/srsLogic';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Home } from 'lucide-react';
import Link from 'next/link';
import { useStreak } from '@/hooks/useStreak';

interface Card {
  id: string;
  word: string;
  meaning_es: string;
  meaning_en?: string;
  example?: string;
  interval: number;
  repetition_count: number;
  easiness_factor: number;
}

interface StudySessionProps {
  cards: Card[];
  direction?: 'en-es' | 'es-en';
}

export default function StudySession({ cards: initialCards, direction = 'en-es' }: StudySessionProps) {
  const [cards, setCards] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const { completeDailyWords } = useStreak();

  const handleAnswer = async (isCorrect: boolean) => {
    const currentCard = cards[currentIndex];
    
    // Calculate next review metadata
    const { interval, repetition_count, next_review } = calculateNextReview({
      interval: currentCard.interval,
      repetition_count: currentCard.repetition_count,
      easiness_factor: currentCard.easiness_factor,
      isCorrect
    });

    // Update in Supabase
    const { error } = await supabase
      .from('cards')
      .update({
        interval,
        repetition_count,
        next_review: next_review.toISOString()
      })
      .eq('id', currentCard.id);

    if (error) {
      console.error('Error updating card:', error);
    }

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSessionFinished(true);
      // Logic for streak: Check if all due cards are finished
      const now = new Date().toISOString();
      const { count } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .lte('next_review', now);

      if (count === 0) {
        // If no more cards are due, the user has completed their "palabras diarias"
        await completeDailyWords();
      }
    }
  };

  if (sessionFinished) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-2">¡Sesión Terminada!</h2>
        <p className="text-muted mb-8 max-w-xs">Has repasado todas las palabras pendientes por hoy. ¡Buen trabajo!</p>
        <Link 
          href="/"
          className="flex items-center gap-2 py-3 px-8 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
        >
          <Home size={20} />
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  if (cards.length === 0) {
     return (
        <div className="py-20 text-center">
            <p className="text-muted">No hay tarjetas para repasar en este momento.</p>
            <Link href="/" className="text-accent underline mt-4 block">Volver</Link>
        </div>
     );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex) / cards.length) * 100;

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div 
          className="h-full bg-accent transition-all duration-500" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-sm text-muted mb-2">
        <span>Progreso: {Math.round(progress)}%</span>
        <span>{currentIndex + 1} / {cards.length}</span>
      </div>

      <Flashcard 
        key={currentCard.id}
        word={currentCard.word}
        meaning_es={currentCard.meaning_es}
        meaning_en={currentCard.meaning_en}
        example={currentCard.example}
        onAnswer={handleAnswer}
        direction={direction}
      />
    </div>
  );
}
