import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Message,
  Artifact,
  AIModel,
  FREE_MODELS,
  ProjectContext,
  WorkflowPhase,
  ToolType,
  Session,
  Persona,
  CompetitorAnalysis,
  FluxImageGen,
} from '@/types/gnexus';
import { GNEXUS_SYSTEM_PROMPT } from '@/lib/prompts';

interface GnexusContextType {
  // Session
  session: Session;

  // Messages
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string, attachments?: { type: 'image' | 'file'; content: string; name: string }[]) => Promise<void>;
  clearMessages: () => void;

  // Model
  currentModel: AIModel;
  setCurrentModel: (model: AIModel) => void;
  models: AIModel[];

  // Artifacts
  artifacts: Artifact[];
  addArtifact: (artifact: Artifact) => void;
  removeArtifact: (id: string) => void;
  getArtifactsByType: (type: ToolType) => Artifact[];

  // Project context
  projectContext: ProjectContext;
  setProjectContext: (context: ProjectContext) => void;
  updateProjectContext: (updates: Partial<ProjectContext>) => void;

  // Workflow
  workflowPhases: WorkflowPhase[];
  updatePhaseStatus: (phaseNumber: number, status: 'completed' | 'active' | 'pending') => void;
  updateSubstep: (phaseNumber: number, stepIndex: number, completed: boolean) => void;
  getWorkflowProgress: () => { completed: number; total: number; percentage: number };

  // Tool modals
  activeToolModal: ToolType | null;
  openToolModal: (tool: ToolType) => void;
  closeToolModal: () => void;

  // Generate artifact using AI
  generateArtifact: (tool: ToolType, inputs: Record<string, string>) => Promise<Artifact | null>;

  // Derived data
  getPersonas: () => Persona[];
  getCompetitors: () => CompetitorAnalysis | null;
}

const GnexusContext = createContext<GnexusContextType | undefined>(undefined);

const initialWorkflowPhases: WorkflowPhase[] = [
  {
    number: 0,
    title: 'Phase 0: Alignment',
    description: 'Clarify goals, constraints & scope',
    status: 'pending',
    substeps: [
      { label: 'Rephrase user request', completed: false },
      { label: 'Identify assumptions', completed: false },
      { label: 'Ask clarifying questions', completed: false },
    ],
  },
  {
    number: 1,
    title: 'Phase 1: Context & Users',
    description: 'Define audience, needs & JTBD',
    status: 'pending',
    substeps: [
      { label: 'Business context summary', completed: false },
      { label: 'Target user profiles', completed: false },
      { label: 'Persona generation', completed: false },
      { label: 'Jobs-to-be-done mapping', completed: false },
      { label: 'Context of use analysis', completed: false },
      { label: 'Accessibility requirements', completed: false },
    ],
  },
  {
    number: 2,
    title: 'Phase 2: Problem & Value',
    description: 'Frame problems & success criteria',
    status: 'pending',
    substeps: [
      { label: 'Problem statements', completed: false },
      { label: 'Success criteria', completed: false },
      { label: 'Risk assessment', completed: false },
    ],
  },
  {
    number: 3,
    title: 'Phase 3: IA & Flows',
    description: 'Navigation, entities & journeys',
    status: 'pending',
    substeps: [
      { label: 'Information architecture', completed: false },
      { label: 'User flows', completed: false },
      { label: 'Navigation structure', completed: false },
    ],
  },
  {
    number: 4,
    title: 'Phase 4: Interaction',
    description: 'Screen specs, states & behaviors',
    status: 'pending',
    substeps: [
      { label: 'Screen specifications', completed: false },
      { label: 'Component states', completed: false },
      { label: 'Interaction patterns', completed: false },
    ],
  },
  {
    number: 5,
    title: 'Phase 5: Visual & Content',
    description: 'UI patterns, hierarchy & microcopy',
    status: 'pending',
    substeps: [
      { label: 'Visual design', completed: false },
      { label: 'Typography & colors', completed: false },
      { label: 'Microcopy', completed: false },
    ],
  },
  {
    number: 6,
    title: 'Phase 6: Validation & Handoff',
    description: 'Testing, analytics & dev specs',
    status: 'pending',
    substeps: [
      { label: 'Usability testing', completed: false },
      { label: 'Analytics planning', completed: false },
      { label: 'Developer handoff', completed: false },
    ],
  },
];

const initialProjectContext: ProjectContext = {
  name: '',
  productType: '',
  platforms: [],
  businessModel: '',
  targetAudience: '',
};

const generateSessionId = () => {
  return `GC-${Date.now().toString(36).toUpperCase()}`;
};

export function GnexusProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({
    id: generateSessionId(),
    startTime: new Date(),
    messageCount: 0,
    artifactCount: 0,
    currentPhase: 0,
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<AIModel>(FREE_MODELS[0]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [projectContext, setProjectContext] = useState<ProjectContext>(initialProjectContext);
  const [workflowPhases, setWorkflowPhases] = useState<WorkflowPhase[]>(initialWorkflowPhases);
  const [activeToolModal, setActiveToolModal] = useState<ToolType | null>(null);

  // Update session stats
  useEffect(() => {
    setSession(prev => ({
      ...prev,
      messageCount: messages.length,
      artifactCount: artifacts.length,
    }));
  }, [messages.length, artifacts.length]);

  const updateProjectContext = useCallback((updates: Partial<ProjectContext>) => {
    setProjectContext(prev => ({ ...prev, ...updates }));
  }, []);

  const sendMessage = useCallback(async (content: string, attachments?: { type: 'image' | 'file'; content: string; name: string }[]) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
      attachments,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Start first phase when first message is sent
    if (messages.length === 0) {
      setWorkflowPhases(prev =>
        prev.map((phase, i) =>
          i === 0 ? { ...phase, status: 'active' as const, time: 'In progress' } : phase
        )
      );
    }

    let modelIndex = FREE_MODELS.findIndex(m => m.id === currentModel.id);
    let attempts = 0;
    const maxAttempts = FREE_MODELS.length;

    while (attempts < maxAttempts) {
      try {
        const modelToUse = FREE_MODELS[modelIndex];

        const formatMessage = (msg: Message) => {
          if (msg.role === 'system') return { role: 'system', content: msg.content };

          if (!msg.attachments || msg.attachments.length === 0) {
            return { role: msg.role, content: msg.content };
          }

          // Mixed content support for vision models
          return {
            role: msg.role,
            content: [
              { type: 'text', text: msg.content },
              ...msg.attachments.map(att =>
                att.type === 'image'
                  ? { type: 'image_url', image_url: { url: att.content } }
                  : null
              ).filter(Boolean)
            ]
          };
        };

        const messagesToSend = [
          { role: 'system' as const, content: GNEXUS_SYSTEM_PROMPT },
          ...messages.map(formatMessage),
          formatMessage(userMessage),
        ];

        const { data, error } = await supabase.functions.invoke('openrouter-chat', {
          body: {
            messages: messagesToSend,
            model: modelToUse.id,
            stream: false,
          },
        });

        if (error) throw error;

        const assistantContent = data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response.';

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
          modelUsed: modelToUse.name,
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error(`Error with model ${FREE_MODELS[modelIndex].name}:`, error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // If rate limited or error, try next model
        if (errorMessage.includes('429') || errorMessage.includes('rate') || attempts < maxAttempts - 1) {
          modelIndex = (modelIndex + 1) % FREE_MODELS.length;
          attempts++;
          console.log(`Switching to model: ${FREE_MODELS[modelIndex].name}`);
          continue;
        }

        // Final fallback error message
        const fallbackMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'I apologize, but all AI models are currently busy. Please try again in a moment.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, fallbackMessage]);
        break;
      }
    }

    setIsLoading(false);
  }, [messages, currentModel]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSession({
      id: generateSessionId(),
      startTime: new Date(),
      messageCount: 0,
      artifactCount: artifacts.length,
      currentPhase: 0,
    });
  }, [artifacts.length]);

  const addArtifact = useCallback((artifact: Artifact) => {
    setArtifacts(prev => [...prev, artifact]);
  }, []);

  const removeArtifact = useCallback((id: string) => {
    setArtifacts(prev => prev.filter(a => a.id !== id));
  }, []);

  const getArtifactsByType = useCallback((type: ToolType) => {
    return artifacts.filter(a => a.type === type);
  }, [artifacts]);

  const getPersonas = useCallback(() => {
    return artifacts.filter(a => a.type === 'persona') as Persona[];
  }, [artifacts]);

  const getCompetitors = useCallback(() => {
    const analysis = artifacts.find(a => a.type === 'competitor-analysis') as CompetitorAnalysis | undefined;
    return analysis || null;
  }, [artifacts]);

  const updatePhaseStatus = useCallback((phaseNumber: number, status: 'completed' | 'active' | 'pending') => {
    setWorkflowPhases(prev =>
      prev.map(phase =>
        phase.number === phaseNumber ? { ...phase, status } : phase
      )
    );
    if (status === 'active') {
      setSession(prev => ({ ...prev, currentPhase: phaseNumber }));
    }
  }, []);

  const updateSubstep = useCallback((phaseNumber: number, stepIndex: number, completed: boolean) => {
    setWorkflowPhases(prev =>
      prev.map(phase =>
        phase.number === phaseNumber
          ? {
            ...phase,
            substeps: phase.substeps.map((step, i) =>
              i === stepIndex ? { ...step, completed } : step
            ),
          }
          : phase
      )
    );
  }, []);

  const getWorkflowProgress = useCallback(() => {
    const totalSubsteps = workflowPhases.reduce((acc, phase) => acc + phase.substeps.length, 0);
    const completedSubsteps = workflowPhases.reduce(
      (acc, phase) => acc + phase.substeps.filter(s => s.completed).length,
      0
    );
    const percentage = totalSubsteps > 0 ? Math.round((completedSubsteps / totalSubsteps) * 100) : 0;
    return { completed: completedSubsteps, total: totalSubsteps, percentage };
  }, [workflowPhases]);

  const openToolModal = useCallback((tool: ToolType) => {
    setActiveToolModal(tool);
  }, []);

  const closeToolModal = useCallback(() => {
    setActiveToolModal(null);
  }, []);

  const generateArtifact = useCallback(async (tool: ToolType, inputs: Record<string, string>): Promise<Artifact | null> => {
    setIsLoading(true);

    let modelIndex = FREE_MODELS.findIndex(m => m.id === currentModel.id);
    let attempts = 0;
    const maxAttempts = FREE_MODELS.length;

    while (attempts < maxAttempts) {
      try {
        const modelToUse = FREE_MODELS[modelIndex];

        const {
          getPersonaPrompt,
          getJTBDPrompt,
          getJourneyPrompt,
          getFlowPrompt,
          getWireframePrompt,
          getComponentPrompt,
          getMicrocopyPrompt,
          getHandoffPrompt,
          getMarketResearchPrompt,
          getCompetitorPrompt,
          getTrendPrompt,
          getABTestPrompt,
          getAccessibilityPrompt,
          getColorPalettePrompt,
          getTypographyPrompt,
          getErrorMessagePrompt,
          getOnboardingPrompt,
          getVideoReviewPrompt,
          getTextExtractorPrompt,
          getImageCaptionPrompt,
          getCodeReviewPrompt,
          getRegexGeneratorPrompt,
          getSqlGeneratorPrompt,
          getUnitTestPrompt,
          getJsonFormatterPrompt,
          getCodeConverterPrompt,
          getResumeOptimizerPrompt,
          getEmailDrafterPrompt,
          getSocialMediaPostPrompt,
          getSeoAnalyzerPrompt,
          getMeetingSummarizerPrompt,
          getTranslatorPrompt,
          getJobDescriptionPrompt,
          getPaletteGeneratorPrompt,
          getLegalContractReviewPrompt,
          getSwotAnalysisPrompt,
          getBusinessModelCanvasPrompt,
          getInterviewPrepPrompt,
          getRecipeGeneratorPrompt,
          getWorkoutPlannerPrompt,
          getTravelPlannerPrompt,
          getGiftSuggesterPrompt,
          getSloganGeneratorPrompt,
          getDomainNamerPrompt,
          getEli5Prompt,
          getSentimentAnalyzerPrompt,
          getCitationGeneratorPrompt,
          getStoryPlotGeneratorPrompt,
        } = await import('@/lib/prompts');

        let prompt = '';

        switch (tool) {
          case 'persona':
            prompt = getPersonaPrompt(projectContext, inputs.description || '');
            break;
          case 'jtbd':
            prompt = getJTBDPrompt(projectContext, inputs.userType || '');
            break;
          case 'journey':
            prompt = getJourneyPrompt(projectContext, inputs.goal || '');
            break;
          case 'flow':
            prompt = getFlowPrompt(projectContext, inputs.feature || '');
            break;
          case 'wireframe':
            prompt = getWireframePrompt(projectContext, inputs.screenName || '', inputs.purpose || '');
            break;
          case 'component':
            prompt = getComponentPrompt(inputs.componentName || '', inputs.purpose || '');
            break;
          case 'microcopy':
            prompt = getMicrocopyPrompt(inputs.context || '', inputs.element || '');
            break;
          case 'handoff':
            prompt = getHandoffPrompt(inputs.componentOrScreen || '');
            break;
          case 'market-research':
            prompt = getMarketResearchPrompt(inputs.category || '', inputs.industry || '');
            break;
          case 'competitor-analysis':
            prompt = getCompetitorPrompt(inputs.competitors || '');
            break;
          case 'trend-analysis':
            prompt = getTrendPrompt(inputs.industry || '');
            break;
          case 'ab-test':
            prompt = getABTestPrompt(inputs.hypothesis || '', inputs.feature || '');
            break;
          case 'accessibility':
            prompt = getAccessibilityPrompt(inputs.component || '', inputs.level || '');
            break;
          case 'color-palette':
            prompt = getColorPalettePrompt(inputs.mood || '', inputs.industry || '');
            break;
          case 'typography':
            prompt = getTypographyPrompt(inputs.tone || '', inputs.platform || '');
            break;
          case 'error-message':
            prompt = getErrorMessagePrompt(inputs.errorType || '', inputs.context || '');
            break;
          case 'onboarding':
            prompt = getOnboardingPrompt(inputs.productType || '', inputs.targetUser || '');
            break;
          case 'video-reviewer':
            prompt = getVideoReviewPrompt(inputs.context || '', inputs.aspects || '');
            break;
          case 'text-extractor':
            prompt = getTextExtractorPrompt(inputs.description || '', inputs.format || '');
            break;
          case 'image-captioner':
            prompt = getImageCaptionPrompt(inputs.description || '', inputs.tone || '');
            break;
          case 'code-reviewer':
            prompt = getCodeReviewPrompt(inputs.code || '', inputs.language || 'typescript');
            break;
          case 'regex-generator':
            prompt = getRegexGeneratorPrompt(inputs.description || '', inputs.testCases || '');
            break;
          case 'sql-generator':
            prompt = getSqlGeneratorPrompt(inputs.query || '', inputs.dialect || 'postgres');
            break;
          case 'unit-test-generator':
            prompt = getUnitTestPrompt(inputs.code || '', inputs.framework || 'jest');
            break;
          case 'json-formatter':
            prompt = getJsonFormatterPrompt(inputs.json || '');
            break;
          case 'code-converter':
            prompt = getCodeConverterPrompt(inputs.code || '', inputs.sourceLang || '', inputs.targetLang || '');
            break;
          case 'resume-optimizer':
            prompt = getResumeOptimizerPrompt(inputs.resume || '', inputs.role || '');
            break;
          case 'email-drafter':
            prompt = getEmailDrafterPrompt(inputs.purpose || '', inputs.audience || '', inputs.keyPoints || '');
            break;
          case 'social-media-post':
            prompt = getSocialMediaPostPrompt(inputs.topic || '', inputs.platform || '');
            break;
          case 'seo-analyzer':
            prompt = getSeoAnalyzerPrompt(inputs.content || '', inputs.keyword || '');
            break;
          case 'meeting-summarizer':
            prompt = getMeetingSummarizerPrompt(inputs.transcript || '');
            break;
          case 'language-translator':
            prompt = getTranslatorPrompt(inputs.text || '', inputs.sourceLang || '', inputs.targetLang || '');
            break;
          case 'job-description-generator':
            prompt = getJobDescriptionPrompt(inputs.title || '', inputs.company || '');
            break;
          case 'palette-generator':
            prompt = getPaletteGeneratorPrompt(inputs.mood || '', inputs.baseColor || '');
            break;
          case 'legal-contract-review':
            prompt = getLegalContractReviewPrompt(inputs.text || '', inputs.focus || '');
            break;
          case 'swot-analysis':
            prompt = getSwotAnalysisPrompt(inputs.subject || '', inputs.context || '');
            break;
          case 'business-model-canvas':
            prompt = getBusinessModelCanvasPrompt(inputs.idea || '');
            break;
          case 'interview-prep':
            prompt = getInterviewPrepPrompt(inputs.role || '', inputs.level || '');
            break;
          case 'recipe-generator':
            prompt = getRecipeGeneratorPrompt(inputs.ingredients || '', inputs.constraints || '');
            break;
          case 'workout-planner':
            prompt = getWorkoutPlannerPrompt(inputs.goal || '', inputs.equipment || '');
            break;
          case 'travel-planner':
            prompt = getTravelPlannerPrompt(inputs.destination || '', inputs.days || '3', inputs.budget || 'moderate');
            break;
          case 'gift-suggester':
            prompt = getGiftSuggesterPrompt(inputs.recipient || '', inputs.budget || '');
            break;
          case 'slogan-generator':
            prompt = getSloganGeneratorPrompt(inputs.brand || '', inputs.keywords || '');
            break;
          case 'domain-namer':
            prompt = getDomainNamerPrompt(inputs.keywords || '', inputs.tlds || '');
            break;
          case 'eli5-explainer':
            prompt = getEli5Prompt(inputs.topic || '', inputs.complexity || '');
            break;
          case 'sentiment-analyzer':
            prompt = getSentimentAnalyzerPrompt(inputs.text || '');
            break;
          case 'citation-generator':
            prompt = getCitationGeneratorPrompt(inputs.url || '', inputs.format || 'APA');
            break;
          case 'story-plot-generator':
            prompt = getStoryPlotGeneratorPrompt(inputs.genre || '', inputs.theme || '');
            break;
          case 'flux-pro-image-gen':
            // Special handling for Flux Pro - direct API call
            const apiKey = inputs.apiKey;
            if (!apiKey) throw new Error('API Key is required for Flux Pro.');

            const fluxResponse = await fetch('https://api.siliconflow.com/v1/images/generations', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'black-forest-labs/FLUX.2-pro', // Updated as per user request
                prompt: inputs.prompt,
                image_size: inputs.image_size || '1024x1024',
                seed: inputs.seed ? parseInt(inputs.seed) : undefined
              })
            });

            if (!fluxResponse.ok) {
              const err = await fluxResponse.json();
              throw new Error(err.message || 'Failed to generate image');
            }

            const fluxData = await fluxResponse.json();
            // Expecting fluxData.data[0].url
            const imageUrl = fluxData.data?.[0]?.url;

            if (!imageUrl) throw new Error('No image URL returned.');

            // Create artifact immediately
            const artifact: FluxImageGen = {
              id: crypto.randomUUID(),
              type: 'flux-pro-image-gen',
              imageUrl,
              prompt: inputs.prompt,
              size: inputs.image_size || '1024x1024',
              model: 'black-forest-labs/FLUX.2-pro',
              createdAt: new Date()
            };

            addArtifact(artifact);
            setIsLoading(false);
            return artifact;

          default:
            throw new Error(`Unknown tool type: ${tool}`);
        }

        // Check for file inputs (base64)
        const content: any[] = [{ type: 'text', text: prompt }];

        Object.entries(inputs).forEach(([key, value]) => {
          if (typeof value === 'string' && value.startsWith('data:')) {
            // It's a file
            if (value.startsWith('data:image')) {
              content.push({
                type: 'image_url',
                image_url: {
                  url: value
                }
              });
            } else if (value.startsWith('data:video')) {
              // Support for video if model supports it (OpenRouter specific)
              // Some models take video as image_url or custom type. 
              // For now, sending as image_url is the most common hack for vision models if official video type isn't standard.
              // But let's try 'image_url' as generic media container or 'video_url' if supported.
              // Safest for now: treat as image_url for vision models, or investigate provider specs.
              // Let's assume standard OpenAI multimodal.
              content.push({
                type: 'image_url',
                image_url: {
                  url: value
                }
              });
            }
          }
        });

        const finalContent = content.length === 1 ? prompt : content;

        const { data, error } = await supabase.functions.invoke('openrouter-chat', {
          body: {
            messages: [
              { role: 'system', content: 'You are G-CORE01, an AI design assistant. Generate structured JSON output as requested. Return ONLY valid JSON. Do not include markdown formatting. ESCAPE all newlines and quotes in string values (e.g. use \\n for newlines).' },
              { role: 'user', content: finalContent },
            ],
            model: modelToUse.id,
            stream: false,
          },
        });

        if (error) throw error;

        const responseContent = data.choices?.[0]?.message?.content || '';

        // Parse JSON from response
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Failed to parse JSON from response');
        }

        // Clean up markdown if present inside the match (e.g. if match included code blocks)
        const clean = jsonMatch[0].replace(/```json/g, '').replace(/```/g, '');

        let parsed;
        try {
          parsed = JSON.parse(clean);
        } catch (e) {
          console.warn('JSON parse failed, attempting strict cleanup', e);
          // Try escaping control chars as last resort
          const escaped = clean.replace(/\n/g, '\\n').replace(/\r/g, '');
          parsed = JSON.parse(escaped);
        }

        // Create artifact with proper type and ID
        const artifact: Artifact = {
          id: crypto.randomUUID(),
          type: tool,
          createdAt: new Date(),
          ...parsed,
        } as Artifact;

        addArtifact(artifact);
        setIsLoading(false);
        return artifact;
      } catch (error) {
        console.error(`Error generating artifact with ${FREE_MODELS[modelIndex].name}:`, error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (errorMessage.includes('429') || errorMessage.includes('rate') || attempts < maxAttempts - 1) {
          modelIndex = (modelIndex + 1) % FREE_MODELS.length;
          attempts++;
          continue;
        }

        break;
      }
    }

    setIsLoading(false);
    return null;
  }, [projectContext, currentModel, addArtifact]);

  const value: GnexusContextType = {
    session,
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    currentModel,
    setCurrentModel,
    models: FREE_MODELS,
    artifacts,
    addArtifact,
    removeArtifact,
    getArtifactsByType,
    projectContext,
    setProjectContext,
    updateProjectContext,
    workflowPhases,
    updatePhaseStatus,
    updateSubstep,
    getWorkflowProgress,
    activeToolModal,
    openToolModal,
    closeToolModal,
    generateArtifact,
    getPersonas,
    getCompetitors,
  };

  return (
    <GnexusContext.Provider value={value}>
      {children}
    </GnexusContext.Provider>
  );
}

export function useGnexus() {
  const context = useContext(GnexusContext);
  if (context === undefined) {
    throw new Error('useGnexus must be used within a GnexusProvider');
  }
  return context;
}
