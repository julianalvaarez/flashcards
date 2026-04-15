'use client';

import { useState } from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  word: string;
  meaning_es: string;
  meaning_en?: string;
  example?: string;
  onAnswer: (isCorrect: boolean) => void;
}

export default function Flashcard({ word, meaning_es, meaning_en, example, onAnswer }: CardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full max-w-sm mx-auto h-[400px] perspective-1000 group">
      <div
        className={cn(
          "relative w-full h-full text-center transition-all duration-500 preserve-3d cursor-pointer",
          isFlipped && "rotate-y-180"
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Face */}
        <div className="absolute inset-0 w-full h-full backface-hidden glass flex flex-col items-center justify-center p-6 shadow-xl animate-fade-in">
          <span className="text-muted text-sm uppercase tracking-widest mb-4">Palabra</span>
          <h2 className="text-4xl font-bold text-foreground">{word}</h2>
          <div className="mt-8 text-muted text-sm animate-pulse">
            Toca para ver el significado
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 glass flex flex-col items-center justify-center p-6 shadow-xl border-accent/20">
          <span className="text-muted text-sm uppercase tracking-widest mb-4">Significado</span>
          <h2 className="text-3xl font-bold text-accent mb-2">{meaning_es}</h2>
          {meaning_en && <p className="text-muted italic mb-4">"{meaning_en}"</p>}
          {example && (
             <div className="mt-4 p-4 bg-white/5 rounded-lg text-sm text-left w-full border border-white/5">
                <span className="text-accent font-bold block mb-1">Ejemplo:</span>
                <p className="text-foreground">{example}</p>
             </div>
          )}

          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onAnswer(false)}
              className="flex-1 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors font-medium border border-red-500/20"
            >
              No la sabía
            </button>
            <button
              onClick={() => onAnswer(true)}
              className="flex-1 py-3 px-4 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl transition-colors font-medium border border-green-500/20"
            >
              La sabía
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
