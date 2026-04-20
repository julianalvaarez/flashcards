import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);

  const fetchStreak = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ user_id: user.id, streak: 0 }])
          .select()
          .single();
        
        if (createError) throw createError;
        profile = newProfile;
      } else if (error) {
        throw error;
      }

      if (profile) {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = profile.last_completion_date;
        
        // Check if streak should be reset
        if (lastDate) {
          const lastDateObj = new Date(lastDate);
          const todayObj = new Date(today);
          const diffTime = Math.abs(todayObj.getTime() - lastDateObj.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 1 && lastDate !== today) {
            // Missed more than a day, reset streak
            await supabase
              .from('profiles')
              .update({ streak: 0 })
              .eq('user_id', user.id);
            setStreak(0);
          } else {
            setStreak(profile.streak);
          }
          
          setHasCompletedToday(lastDate === today);
        } else {
          setStreak(0);
          setHasCompletedToday(false);
        }
      }
    } catch (err) {
      console.error('Error fetching streak:', err);
    } finally {
      setLoading(false);
    }
  };

  const completeDailyWords = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Fetch current profile to check last completion
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile) return;
    if (profile.last_completion_date === today) return; // Already completed today

    let newStreak = 1;
    const lastDate = profile.last_completion_date;

    if (lastDate) {
      const lastDateObj = new Date(lastDate);
      const todayObj = new Date(today);
      const diffTime = Math.abs(todayObj.getTime() - lastDateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = profile.streak + 1;
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        streak: newStreak,
        last_completion_date: today
      })
      .eq('user_id', user.id);

    if (!error) {
      setStreak(newStreak);
      setHasCompletedToday(true);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  return { streak, loading, hasCompletedToday, completeDailyWords, fetchStreak };
}
