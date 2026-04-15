'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useDashboard() {
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select(`
          *,
          cards(id, next_review)
        `)
        .order('created_at', { ascending: false });

      if (foldersError) throw foldersError;

      const processedFolders = foldersData.map(folder => {
        const now = new Date();
        const dueCount = folder.cards?.filter((card: any) => new Date(card.next_review) <= now).length || 0;
        return {
          ...folder,
          cardCount: folder.cards?.length || 0,
          dueCount
        };
      });

      setFolders(processedFolders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const createFolder = async (name: string) => {
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) return;

     const { error } = await supabase
        .from('folders')
        .insert([{ name, user_id: user.id }]);
     
     if (error) throw error;
     fetchDashboardData();
  };

  return { folders, loading, error, fetchDashboardData, createFolder };
}
