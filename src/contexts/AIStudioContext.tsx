import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Modality, AIModelFull, getModelsByModality } from '@/lib/models';

interface GenerationResult {
  id: string;
  modality: Modality;
  modelId: string;
  modelName: string;
  prompt: string;
  result: string;
  resultType: string;
  status: 'completed' | 'failed' | 'processing';
  error?: string;
  duration?: number;
  createdAt: Date;
}

interface ComparisonItem {
  modelId: string;
  result?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error?: string;
}

interface AIStudioContextType {
  // Current state
  activeModality: Modality;
  setActiveModality: (modality: Modality) => void;
  selectedModel: AIModelFull | null;
  setSelectedModel: (model: AIModelFull | null) => void;
  
  // Generation
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  currentGeneration: GenerationResult | null;
  setCurrentGeneration: (result: GenerationResult | null) => void;
  
  // Comparison mode
  isComparing: boolean;
  setIsComparing: (comparing: boolean) => void;
  comparisonModels: string[];
  setComparisonModels: (models: string[]) => void;
  comparisonResults: ComparisonItem[];
  setComparisonResults: (results: ComparisonItem[]) => void;
  
  // History
  recentGenerations: GenerationResult[];
  addToHistory: (result: GenerationResult) => void;
  clearHistory: () => void;
  
  // UI state
  activeTab: 'generate' | 'compare' | 'history' | 'models' | 'examples';
  setActiveTab: (tab: 'generate' | 'compare' | 'history' | 'models' | 'examples') => void;
  showEditingTools: boolean;
  setShowEditingTools: (show: boolean) => void;
  
  // Helper functions
  getModelsForCurrentModality: () => AIModelFull[];
}

const AIStudioContext = createContext<AIStudioContextType | undefined>(undefined);

export function AIStudioProvider({ children }: { children: ReactNode }) {
  // Modality and model selection
  const [activeModality, setActiveModality] = useState<Modality>('image');
  const [selectedModel, setSelectedModel] = useState<AIModelFull | null>(null);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState<GenerationResult | null>(null);
  
  // Comparison state
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonModels, setComparisonModels] = useState<string[]>([]);
  const [comparisonResults, setComparisonResults] = useState<ComparisonItem[]>([]);
  
  // History (local state, also synced to DB)
  const [recentGenerations, setRecentGenerations] = useState<GenerationResult[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'generate' | 'compare' | 'history' | 'models' | 'examples'>('generate');
  const [showEditingTools, setShowEditingTools] = useState(false);
  
  const addToHistory = useCallback((result: GenerationResult) => {
    setRecentGenerations(prev => [result, ...prev].slice(0, 50));
  }, []);
  
  const clearHistory = useCallback(() => {
    setRecentGenerations([]);
  }, []);
  
  const getModelsForCurrentModality = useCallback(() => {
    return getModelsByModality(activeModality);
  }, [activeModality]);
  
  return (
    <AIStudioContext.Provider
      value={{
        activeModality,
        setActiveModality,
        selectedModel,
        setSelectedModel,
        isGenerating,
        setIsGenerating,
        currentGeneration,
        setCurrentGeneration,
        isComparing,
        setIsComparing,
        comparisonModels,
        setComparisonModels,
        comparisonResults,
        setComparisonResults,
        recentGenerations,
        addToHistory,
        clearHistory,
        activeTab,
        setActiveTab,
        showEditingTools,
        setShowEditingTools,
        getModelsForCurrentModality,
      }}
    >
      {children}
    </AIStudioContext.Provider>
  );
}

export function useAIStudio() {
  const context = useContext(AIStudioContext);
  if (!context) {
    throw new Error('useAIStudio must be used within AIStudioProvider');
  }
  return context;
}
