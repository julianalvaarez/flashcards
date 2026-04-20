'use client';

import { Flame } from 'lucide-react';
import { useStreak } from '@/hooks/useStreak';

export default function StreakBadge() {
  const { streak, loading, hasCompletedToday } = useStreak();

  if (loading && streak === 0) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${
      hasCompletedToday 
        ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' 
        : 'bg-white/5 border-white/10 text-muted-foreground'
    }`}>
      <Flame size={18} className={hasCompletedToday ? 'fill-orange-500' : ''} />
      <span className="font-bold text-sm">
        {streak} {streak === 1 ? 'día' : 'días'}
      </span>
    </div>
  );
}
