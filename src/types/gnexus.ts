// Message types
// Message types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
  modelUsed?: string;
  attachments?: { type: 'image' | 'file'; content: string; name: string }[];
}

// Session tracking
export interface Session {
  id: string;
  startTime: Date;
  messageCount: number;
  artifactCount: number;
  currentPhase: number;
}

export type ModelCapability = 'vision' | 'reasoning' | 'code' | 'uncensored' | 'video' | 'agentic';

// Model definitions
export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  icon: 'sparkles' | 'brain' | 'zap' | 'search' | 'code';
  capabilities: ModelCapability[];
}

export const FREE_MODELS: AIModel[] = [
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2',
    description: 'Fast & efficient',
    provider: 'Meta',
    icon: 'zap',
    capabilities: [],
  },
  {
    id: 'qwen/qwen-2.5-7b-instruct:free',
    name: 'Qwen 2.5',
    description: 'Strong reasoning',
    provider: 'Alibaba',
    icon: 'brain',
    capabilities: ['reasoning', 'code'],
  },
  {
    id: 'google/gemma-2-9b-it:free',
    name: 'Gemma 2',
    description: 'Balanced',
    provider: 'Google',
    icon: 'sparkles',
    capabilities: ['reasoning'],
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B',
    description: 'Creative writing',
    provider: 'Mistral',
    icon: 'sparkles',
    capabilities: [],
  },
  {
    id: 'deepseek/deepseek-chat:free',
    name: 'DeepSeek',
    description: 'Technical/code',
    provider: 'DeepSeek',
    icon: 'code',
    capabilities: ['code', 'reasoning'],
  },
  {
    id: 'allenai/molmo-2-8b:free',
    name: 'Molmo 2',
    description: 'Vision/Language',
    provider: 'AllenAI',
    icon: 'sparkles',
    capabilities: ['vision', 'video'],
  },
  {
    id: 'nvidia/nemotron-3-nano-30b-a3b:free',
    name: 'Nemotron 3 30B',
    description: 'Efficient MoE',
    provider: 'Nvidia',
    icon: 'zap',
    capabilities: ['agentic', 'reasoning'],
  },
  {
    id: 'nvidia/nemotron-nano-12b-v2-vl:free',
    name: 'Nemotron 2 VL',
    description: 'Vision/Docs',
    provider: 'Nvidia',
    icon: 'sparkles',
    capabilities: ['vision', 'video'],
  },
  {
    id: 'openai/gpt-oss-120b:free',
    name: 'GPT-OSS 120B',
    description: 'Agentic MoE',
    provider: 'OpenAI',
    icon: 'brain',
    capabilities: ['agentic', 'reasoning', 'code'],
  },
  {
    id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    name: 'Dolphin Mistral 24B',
    description: 'Uncensored',
    provider: 'Cognitive',
    icon: 'sparkles',
    capabilities: ['uncensored'],
  },
  {
    id: 'qwen/qwen-2.5-vl-7b-instruct:free',
    name: 'Qwen 2.5 VL',
    description: 'Vision/Video',
    provider: 'Alibaba',
    icon: 'brain',
    capabilities: ['vision', 'video'],
  },
];

// Persona artifact
export interface Persona {
  id: string;
  type: 'persona';
  name: string;
  role: string;
  initials: string;
  category: 'primary' | 'secondary';
  goals: string[];
  behaviors: string[];
  painPoints: string[];
  environment: string;
  accessibility: string;
  createdAt: Date;
}

// JTBD artifact
export interface JTBD {
  id: string;
  type: 'jtbd';
  userType: string;
  jobStatement: string;
  functionalJobs: string[];
  emotionalJobs: string[];
  socialJobs: string[];
  outcomes: string[];
  createdAt: Date;
}

// Journey artifact
export interface Journey {
  id: string;
  type: 'journey';
  personaId?: string;
  goal: string;
  stages: JourneyStage[];
  createdAt: Date;
}

export interface JourneyStage {
  name: string;
  userGoals: string[];
  actions: string[];
  emotions: string;
  painPoints: string[];
  opportunities: string[];
}

// Flow artifact
export interface Flow {
  id: string;
  type: 'flow';
  name: string;
  description: string;
  primaryActor: string;
  goal: string;
  steps: FlowStep[];
  createdAt: Date;
}

export interface FlowStep {
  id: number;
  description: string;
  type: 'action' | 'decision' | 'end';
  branches?: { condition: string; nextStep: number }[];
}

// Wireframe artifact
export interface Wireframe {
  id: string;
  type: 'wireframe';
  screenName: string;
  purpose: string;
  sections: WireframeSection[];
  createdAt: Date;
}

export interface WireframeSection {
  name: string;
  content: string;
  interactiveElements: string[];
  states: string[];
  notes: string;
}

// Component spec artifact
export interface ComponentSpec {
  id: string;
  type: 'component';
  name: string;
  purpose: string;
  props: { name: string; type: string; description: string }[];
  variants: string[];
  states: string[];
  accessibilityNotes: string;
  createdAt: Date;
}

// Microcopy artifact
export interface Microcopy {
  id: string;
  type: 'microcopy';
  context: string;
  element: string;
  variations: { text: string; rationale: string }[];
  bestPractices: string[];
  createdAt: Date;
}

// Handoff artifact
export interface Handoff {
  id: string;
  type: 'handoff';
  componentOrScreen: string;
  technicalSpecs: string;
  states: string[];
  edgeCases: string[];
  apiConsiderations: string;
  createdAt: Date;
}

// Analysis artifacts
export interface MarketResearch {
  id: string;
  type: 'market-research';
  category: string;
  overview: string;
  trends: string[];
  keyPlayers: string[];
  opportunities: string[];
  createdAt: Date;
}

export interface CompetitorAnalysis {
  id: string;
  type: 'competitor-analysis';
  competitors: {
    name: string;
    pros: string[];
    cons: string[];
    features: string[];
  }[];
  createdAt: Date;
}

export interface TrendAnalysis {
  id: string;
  type: 'trend-analysis';
  industry: string;
  emergingPatterns: string[];
  predictions: string[];
  recommendations: string[];
  createdAt: Date;
}

// Video & Media Tools
export interface VideoReview {
  id: string;
  type: 'video-reviewer';
  summary: string;
  timestamps: { time: string; description: string }[];
  anomalies: string[];
  createdAt: Date;
}

export interface TextExtractor {
  id: string;
  type: 'text-extractor';
  extractedText: string;
  confidenceScore: number;
  format: 'plain' | 'structured';
  createdAt: Date;
}

export interface ImageCaption {
  id: string;
  type: 'image-captioner';
  caption: string;
  tags: string[];
  detailedDescription: string;
  createdAt: Date;
}

// Code & Engineering Tools
export interface CodeReview {
  id: string;
  type: 'code-reviewer';
  fileName: string;
  summary: string;
  issues: { severity: 'high' | 'medium' | 'low'; line?: number; description: string; suggestion: string }[];
  bestPractices: string[];
  securityConcerns: string[];
  createdAt: Date;
}

export interface RegexGenerator {
  id: string;
  type: 'regex-generator';
  pattern: string;
  explanation: string;
  examples: { match: string; shouldMatch: boolean }[];
  createdAt: Date;
}

export interface SqlGenerator {
  id: string;
  type: 'sql-generator';
  query: string;
  explanation: string;
  dialect: 'postgres' | 'mysql' | 'sqlite' | 'sqlserver';
  createdAt: Date;
}

export interface UnitTest {
  id: string;
  type: 'unit-test-generator';
  code: string;
  framework: string;
  coverage: string;
  createdAt: Date;
}

export interface JsonFormatter {
  id: string;
  type: 'json-formatter';
  formattedJson: string;
  isValid: boolean;
  errors?: string[];
  createdAt: Date;
}

export interface CodeConverter {
  id: string;
  type: 'code-converter';
  sourceLanguage: string;
  targetLanguage: string;
  convertedCode: string;
  notes: string;
  createdAt: Date;
}

// Content & Productivity
export interface ResumeOptimizer {
  id: string;
  type: 'resume-optimizer';
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: { section: string; advice: string; example: string }[];
  createdAt: Date;
}

export interface EmailDraft {
  id: string;
  type: 'email-drafter';
  subject: string;
  body: string;
  tone: string;
  audience: string;
  createdAt: Date;
}

export interface SocialMediaPost {
  id: string;
  type: 'social-media-post';
  platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook';
  content: string;
  hashtags: string[];
  mediaSuggestion: string;
  createdAt: Date;
}

export interface SeoAnalysis {
  id: string;
  type: 'seo-analyzer';
  keyword: string;
  score: number;
  titleCheck: string;
  metaDescriptionCheck: string;
  contentSuggestions: string[];
  createdAt: Date;
}

export interface MeetingSummary {
  id: string;
  type: 'meeting-summarizer';
  title: string;
  attendees: string[];
  keyPoints: string[];
  actionItems: { owner?: string; task: string; due?: string }[];
  decisions: string[];
  createdAt: Date;
}

export interface Translation {
  id: string;
  type: 'language-translator';
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  translatedText: string;
  culturalNotes?: string;
  createdAt: Date;
}

export interface JobDescription {
  id: string;
  type: 'job-description-generator';
  roleTitle: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  createdAt: Date;
}

export interface PaletteGenerator {
  id: string;
  type: 'palette-generator'; // Enriched version of color-palette
  colors: { hex: string; name: string; usage: string }[];
  mood: string;
  createdAt: Date;
}

// Business & Legal
export interface ContractReview {
  id: string;
  type: 'legal-contract-review';
  riskScore: number;
  summary: string;
  redFlags: { clause: string; concern: string; severity: 'high' | 'medium' }[];
  missingClauses: string[];
  createdAt: Date;
}

export interface SwotAnalysis {
  id: string;
  type: 'swot-analysis';
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  strategy: string;
  createdAt: Date;
}

export interface BusinessModelCanvas {
  id: string;
  type: 'business-model-canvas';
  keyPartners: string[];
  keyActivities: string[];
  valuePropositions: string[];
  customerRelationships: string[];
  customerSegments: string[];
  keyResources: string[];
  channels: string[];
  costStructure: string[];
  revenueStreams: string[];
  createdAt: Date;
}

export interface InterviewPrep {
  id: string;
  type: 'interview-prep';
  role: string;
  questions: { question: string; idealAnswerKeyPoints: string[]; difficulty: string }[];
  createdAt: Date;
}

// Lifestyle & Personal
export interface Recipe {
  id: string;
  type: 'recipe-generator';
  name: string;
  ingredients: { item: string; amount: string }[];
  steps: string[];
  prepTime: string;
  calories?: string;
  dietaryTags: string[];
  createdAt: Date;
}

export interface WorkoutPlan {
  id: string;
  type: 'workout-planner';
  goal: string;
  duration: string;
  schedule: { day: string; workout: string; exercises: { name: string; sets: string; reps: string }[] }[];
  createdAt: Date;
}

export interface TravelItinerary {
  id: string;
  type: 'travel-planner';
  destination: string;
  duration: string;
  days: { day: number; activities: { time: string; activity: string; location: string }[] }[];
  budgetEstimate: string;
  createdAt: Date;
}

export interface GiftSuggestions {
  id: string;
  type: 'gift-suggester';
  recipient: string;
  occasion: string;
  ideas: { item: string; priceRange: string; reasoning: string; link?: string }[];
  createdAt: Date;
}

// Creative & Utility
export interface SloganGenerator {
  id: string;
  type: 'slogan-generator';
  brandName: string;
  slogans: { text: string; vibe: string }[];
  createdAt: Date;
}

export interface DomainNames {
  id: string;
  type: 'domain-namer';
  keywords: string;
  domains: { name: string; available: boolean; priceEstimate?: string }[];
  createdAt: Date;
}

export interface Eli5 {
  id: string;
  type: 'eli5-explainer';
  topic: string;
  explanation: string;
  analogy: string;
  createdAt: Date;
}

export interface SentimentAnalysis {
  id: string;
  type: 'sentiment-analyzer';
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  score: number;
  emotions: { name: string; score: number }[];
  createdAt: Date;
}

export interface CitationGenerator {
  id: string;
  type: 'citation-generator';
  source: string;
  format: 'APA' | 'MLA' | 'Chicago' | 'IEEE';
  citation: string;
  createdAt: Date;
}

export interface StoryPlot {
  id: string;
  type: 'story-plot-generator';
  genre: string;
  logline: string;
  characters: { name: string; archetype: string; description: string }[];
  acts: { title: string; summary: string }[];
  createdAt: Date;
}

export interface FluxImageGen {
  id: string;
  type: 'flux-pro-image-gen';
  imageUrl: string;
  prompt: string;
  size: string;
  model: string;
  createdAt: Date;
}

// Union type for all artifacts
export type Artifact =
  | Persona
  | JTBD
  | Journey
  | Flow
  | Wireframe
  | ComponentSpec
  | Microcopy
  | Handoff
  | MarketResearch
  | CompetitorAnalysis
  | TrendAnalysis
  | VideoReview
  | TextExtractor
  | ImageCaption
  | CodeReview
  | RegexGenerator
  | SqlGenerator
  | UnitTest
  | JsonFormatter
  | CodeConverter
  | ResumeOptimizer
  | EmailDraft
  | SocialMediaPost
  | SeoAnalysis
  | MeetingSummary
  | Translation
  | JobDescription
  | PaletteGenerator
  | ContractReview
  | SwotAnalysis
  | BusinessModelCanvas
  | InterviewPrep
  | Recipe
  | WorkoutPlan
  | TravelItinerary
  | GiftSuggestions
  | SloganGenerator
  | DomainNames
  | Eli5
  | SentimentAnalysis
  | CitationGenerator
  | StoryPlot
  | FluxImageGen;

// Workflow phase
export interface WorkflowPhase {
  number: number;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
  time?: string;
  substeps: { label: string; completed: boolean }[];
}

// Project context
export interface ProjectContext {
  name: string;
  productType: string;
  platforms: ('desktop' | 'mobile' | 'web')[];
  businessModel?: string;
  targetAudience?: string;
}

// Tool types
export type ToolType =
  | 'persona'
  | 'jtbd'
  | 'journey'
  | 'flow'
  | 'wireframe'
  | 'component'
  | 'microcopy'
  | 'handoff'
  | 'market-research'
  | 'competitor-analysis'
  | 'trend-analysis'
  | 'ab-test'
  | 'accessibility'
  | 'color-palette'
  | 'typography'
  | 'error-message'
  | 'onboarding'
  | 'text-generation'
  | 'image-generation'
  | 'audio-tool'
  | 'video-generation'
  | 'video-reviewer'
  | 'text-extractor'
  | 'image-captioner'
  | 'code-reviewer'
  | 'regex-generator'
  | 'sql-generator'
  | 'unit-test-generator'
  | 'json-formatter'
  | 'code-converter'
  | 'resume-optimizer'
  | 'email-drafter'
  | 'social-media-post'
  | 'seo-analyzer'
  | 'meeting-summarizer'
  | 'language-translator'
  | 'job-description-generator'
  | 'palette-generator'
  | 'legal-contract-review'
  | 'swot-analysis'
  | 'business-model-canvas'
  | 'interview-prep'
  | 'recipe-generator'
  | 'workout-planner'
  | 'travel-planner'
  | 'gift-suggester'
  | 'slogan-generator'
  | 'domain-namer'
  | 'eli5-explainer'
  | 'sentiment-analyzer'
  | 'citation-generator'
  | 'story-plot-generator'
  | 'flux-pro-image-gen';
