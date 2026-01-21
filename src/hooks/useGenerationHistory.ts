import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Modality } from '@/lib/models';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface GenerationHistoryItem {
  id: string;
  userId: string;
  modality: Modality;
  modelId: string;
  modelName: string;
  prompt: string;
  parameters: Record<string, unknown>;
  resultUrl: string | null;
  resultType: string | null;
  status: 'completed' | 'failed' | 'processing';
  errorMessage: string | null;
  durationMs: number | null;
  createdAt: Date;
}

interface UseGenerationHistoryOptions {
  modality?: Modality;
  limit?: number;
  autoLoad?: boolean;
}

export function useGenerationHistory(options: UseGenerationHistoryOptions = {}) {
  const { modality, limit = 50, autoLoad = true } = options;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('generation_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (modality) {
        query = query.eq('modality', modality);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      const items: GenerationHistoryItem[] = (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        modality: item.modality as Modality,
        modelId: item.model_id,
        modelName: item.model_name,
        prompt: item.prompt,
        parameters: (item.parameters as Record<string, unknown>) || {},
        resultUrl: item.result_url,
        resultType: item.result_type,
        status: item.status as 'completed' | 'failed' | 'processing',
        errorMessage: item.error_message,
        durationMs: item.duration_ms,
        createdAt: new Date(item.created_at || Date.now()),
      }));
      
      setHistory(items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load history';
      setError(message);
      console.error('Error fetching generation history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, modality, limit]);
  
  const addToHistory = useCallback(async (item: Omit<GenerationHistoryItem, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return null;
    
    try {
      const insertData = {
        user_id: user.id,
        modality: item.modality,
        model_id: item.modelId,
        model_name: item.modelName,
        prompt: item.prompt,
        parameters: item.parameters as Json,
        result_url: item.resultUrl,
        result_type: item.resultType,
        status: item.status,
        error_message: item.errorMessage,
        duration_ms: item.durationMs,
      };
      
      const { data, error: insertError } = await supabase
        .from('generation_history')
        .insert(insertData)
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      const newItem: GenerationHistoryItem = {
        id: data.id,
        userId: data.user_id,
        modality: data.modality as Modality,
        modelId: data.model_id,
        modelName: data.model_name,
        prompt: data.prompt,
        parameters: (data.parameters as Record<string, unknown>) || {},
        resultUrl: data.result_url,
        resultType: data.result_type,
        status: data.status as 'completed' | 'failed' | 'processing',
        errorMessage: data.error_message,
        durationMs: data.duration_ms,
        createdAt: new Date(data.created_at || Date.now()),
      };
      
      setHistory(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      console.error('Error adding to history:', err);
      return null;
    }
  }, [user]);
  
  const updateHistoryItem = useCallback(async (id: string, updates: Partial<GenerationHistoryItem>) => {
    try {
      const { error: updateError } = await supabase
        .from('generation_history')
        .update({
          result_url: updates.resultUrl,
          result_type: updates.resultType,
          status: updates.status,
          error_message: updates.errorMessage,
          duration_ms: updates.durationMs,
        })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      setHistory(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    } catch (err) {
      console.error('Error updating history item:', err);
    }
  }, []);
  
  const deleteHistoryItem = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('generation_history')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      setHistory(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Deleted',
        description: 'Generation removed from history',
      });
    } catch (err) {
      console.error('Error deleting history item:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
    }
  }, [toast]);
  
  const clearAllHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('generation_history')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) throw deleteError;
      
      setHistory([]);
      toast({
        title: 'Cleared',
        description: 'All generation history cleared',
      });
    } catch (err) {
      console.error('Error clearing history:', err);
      toast({
        title: 'Error',
        description: 'Failed to clear history',
        variant: 'destructive',
      });
    }
  }, [user, toast]);
  
  // Auto-load history on mount
  useEffect(() => {
    if (autoLoad && user) {
      fetchHistory();
    }
  }, [autoLoad, user, fetchHistory]);
  
  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('generation-history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generation_history',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const data = payload.new;
            const newItem: GenerationHistoryItem = {
              id: data.id,
              userId: data.user_id,
              modality: data.modality as Modality,
              modelId: data.model_id,
              modelName: data.model_name,
              prompt: data.prompt,
              parameters: (data.parameters as Record<string, unknown>) || {},
              resultUrl: data.result_url,
              resultType: data.result_type,
              status: data.status as 'completed' | 'failed' | 'processing',
              errorMessage: data.error_message,
              durationMs: data.duration_ms,
              createdAt: new Date(data.created_at || Date.now()),
            };
            setHistory(prev => {
              if (prev.find(item => item.id === newItem.id)) return prev;
              return [newItem, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const data = payload.new;
            setHistory(prev => prev.map(item => 
              item.id === data.id ? {
                ...item,
                resultUrl: data.result_url,
                resultType: data.result_type,
                status: data.status as 'completed' | 'failed' | 'processing',
                errorMessage: data.error_message,
                durationMs: data.duration_ms,
              } : item
            ));
          } else if (payload.eventType === 'DELETE') {
            const data = payload.old;
            setHistory(prev => prev.filter(item => item.id !== data.id));
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  return {
    history,
    isLoading,
    error,
    fetchHistory,
    addToHistory,
    updateHistoryItem,
    deleteHistoryItem,
    clearAllHistory,
  };
}
