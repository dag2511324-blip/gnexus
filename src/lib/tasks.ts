// Task Categories and Types for comprehensive AI generation

export type TaskCategory = 
  | 'multimodal' 
  | 'nlp' 
  | 'vision' 
  | 'audio' 
  | 'video' 
  | 'code'
  | 'tabular';

export type TaskType = 
  // Multimodal Tasks
  | 'any-to-any'
  | 'image-text-to-text'
  | 'video-text-to-text'
  | 'visual-qa'
  | 'document-qa'
  | 'image-to-text'
  // NLP Tasks
  | 'text-generation'
  | 'summarization'
  | 'translation'
  | 'question-answering'
  | 'text-classification'
  | 'fill-mask'
  | 'sentence-similarity'
  | 'text-ranking'
  | 'token-classification'
  | 'zero-shot-classification'
  // Vision Tasks
  | 'text-to-image'
  | 'image-to-image'
  | 'image-classification'
  | 'object-detection'
  | 'image-segmentation'
  | 'depth-estimation'
  | 'keypoint-detection'
  | 'zero-shot-image-classification'
  | 'zero-shot-object-detection'
  // Audio Tasks
  | 'text-to-speech'
  | 'speech-to-text'
  | 'audio-classification'
  | 'audio-to-audio'
  // Video Tasks
  | 'text-to-video'
  | 'image-to-video'
  | 'video-classification'
  | 'video-to-video'
  // Code Tasks
  | 'code-generation'
  | 'code-completion'
  // Tabular Tasks
  | 'tabular-classification'
  | 'tabular-regression';

export interface TaskDefinition {
  id: TaskType;
  name: string;
  description: string;
  category: TaskCategory;
  icon: string;
  inputType: 'text' | 'image' | 'audio' | 'video' | 'file' | 'multimodal';
  outputType: 'text' | 'image' | 'audio' | 'video' | 'json' | 'classification';
  available: boolean;
  proOnly?: boolean;
  estimatedTime: string;
  endpoint: string;
}

// Task Category Definitions with metadata
export const TASK_CATEGORIES: Record<TaskCategory, {
  name: string;
  icon: string;
  description: string;
  color: string;
  tasks: TaskType[];
}> = {
  nlp: {
    name: 'Natural Language',
    icon: 'FileText',
    description: 'Text understanding and generation',
    color: 'from-orange-500 to-red-500',
    tasks: ['text-generation', 'summarization', 'translation', 'question-answering', 'text-classification', 'fill-mask', 'sentence-similarity'],
  },
  vision: {
    name: 'Computer Vision',
    icon: 'Eye',
    description: 'Image analysis and generation',
    color: 'from-blue-500 to-cyan-500',
    tasks: ['text-to-image', 'image-to-image', 'image-classification', 'object-detection', 'depth-estimation', 'image-segmentation'],
  },
  audio: {
    name: 'Audio',
    icon: 'Music',
    description: 'Speech and sound processing',
    color: 'from-green-500 to-emerald-500',
    tasks: ['text-to-speech', 'speech-to-text', 'audio-classification', 'audio-to-audio'],
  },
  multimodal: {
    name: 'Multimodal',
    icon: 'Layers',
    description: 'Cross-modal understanding',
    color: 'from-purple-500 to-pink-500',
    tasks: ['image-text-to-text', 'visual-qa', 'document-qa', 'image-to-text'],
  },
  code: {
    name: 'Code',
    icon: 'Code',
    description: 'Code generation and analysis',
    color: 'from-violet-500 to-indigo-500',
    tasks: ['code-generation', 'code-completion'],
  },
  video: {
    name: 'Video',
    icon: 'Video',
    description: 'Video generation and analysis',
    color: 'from-rose-500 to-orange-500',
    tasks: ['text-to-video', 'image-to-video', 'video-classification'],
  },
  tabular: {
    name: 'Tabular',
    icon: 'Table',
    description: 'Structured data analysis',
    color: 'from-teal-500 to-cyan-500',
    tasks: ['tabular-classification', 'tabular-regression'],
  },
};

// Complete Task Definitions
export const TASK_DEFINITIONS: TaskDefinition[] = [
  // NLP Tasks
  {
    id: 'text-generation',
    name: 'Text Generation',
    description: 'Generate text from a prompt',
    category: 'nlp',
    icon: 'MessageSquare',
    inputType: 'text',
    outputType: 'text',
    available: true,
    estimatedTime: '2-15s',
    endpoint: 'huggingface-text',
  },
  {
    id: 'summarization',
    name: 'Summarization',
    description: 'Summarize long texts into concise versions',
    category: 'nlp',
    icon: 'FileText',
    inputType: 'text',
    outputType: 'text',
    available: true,
    estimatedTime: '3-20s',
    endpoint: 'huggingface-text',
  },
  {
    id: 'translation',
    name: 'Translation',
    description: 'Translate text between languages',
    category: 'nlp',
    icon: 'Languages',
    inputType: 'text',
    outputType: 'text',
    available: true,
    estimatedTime: '2-10s',
    endpoint: 'huggingface-text',
  },
  {
    id: 'question-answering',
    name: 'Question Answering',
    description: 'Answer questions based on context',
    category: 'nlp',
    icon: 'HelpCircle',
    inputType: 'text',
    outputType: 'text',
    available: true,
    estimatedTime: '2-10s',
    endpoint: 'huggingface-text',
  },
  {
    id: 'text-classification',
    name: 'Text Classification',
    description: 'Classify text into categories',
    category: 'nlp',
    icon: 'Tags',
    inputType: 'text',
    outputType: 'classification',
    available: true,
    estimatedTime: '1-5s',
    endpoint: 'huggingface-text',
  },
  {
    id: 'fill-mask',
    name: 'Fill Mask',
    description: 'Predict missing words in text',
    category: 'nlp',
    icon: 'Puzzle',
    inputType: 'text',
    outputType: 'text',
    available: true,
    estimatedTime: '1-5s',
    endpoint: 'huggingface-text',
  },
  {
    id: 'sentence-similarity',
    name: 'Sentence Similarity',
    description: 'Compare semantic similarity of sentences',
    category: 'nlp',
    icon: 'GitCompare',
    inputType: 'text',
    outputType: 'json',
    available: true,
    estimatedTime: '1-5s',
    endpoint: 'huggingface-text',
  },
  
  // Vision Tasks
  {
    id: 'text-to-image',
    name: 'Text to Image',
    description: 'Generate images from text descriptions',
    category: 'vision',
    icon: 'ImagePlus',
    inputType: 'text',
    outputType: 'image',
    available: true,
    estimatedTime: '5-60s',
    endpoint: 'huggingface-image',
  },
  {
    id: 'image-to-image',
    name: 'Image to Image',
    description: 'Transform or edit existing images',
    category: 'vision',
    icon: 'Wand2',
    inputType: 'multimodal',
    outputType: 'image',
    available: true,
    estimatedTime: '10-45s',
    endpoint: 'huggingface-image',
  },
  {
    id: 'image-classification',
    name: 'Image Classification',
    description: 'Classify images into categories',
    category: 'vision',
    icon: 'ScanSearch',
    inputType: 'image',
    outputType: 'classification',
    available: true,
    estimatedTime: '2-10s',
    endpoint: 'huggingface-vision',
  },
  {
    id: 'object-detection',
    name: 'Object Detection',
    description: 'Detect and locate objects in images',
    category: 'vision',
    icon: 'Box',
    inputType: 'image',
    outputType: 'json',
    available: true,
    estimatedTime: '3-15s',
    endpoint: 'huggingface-vision',
  },
  {
    id: 'depth-estimation',
    name: 'Depth Estimation',
    description: 'Estimate depth from 2D images',
    category: 'vision',
    icon: 'Layers3',
    inputType: 'image',
    outputType: 'image',
    available: true,
    estimatedTime: '5-20s',
    endpoint: 'huggingface-vision',
  },
  {
    id: 'image-segmentation',
    name: 'Image Segmentation',
    description: 'Segment images into regions',
    category: 'vision',
    icon: 'Grid2X2',
    inputType: 'image',
    outputType: 'image',
    available: true,
    estimatedTime: '5-25s',
    endpoint: 'huggingface-vision',
  },
  
  // Audio Tasks
  {
    id: 'text-to-speech',
    name: 'Text to Speech',
    description: 'Convert text to natural speech',
    category: 'audio',
    icon: 'Volume2',
    inputType: 'text',
    outputType: 'audio',
    available: true,
    estimatedTime: '3-15s',
    endpoint: 'huggingface-audio',
  },
  {
    id: 'speech-to-text',
    name: 'Speech to Text',
    description: 'Transcribe speech to text',
    category: 'audio',
    icon: 'Mic',
    inputType: 'audio',
    outputType: 'text',
    available: true,
    estimatedTime: '5-30s',
    endpoint: 'huggingface-audio',
  },
  {
    id: 'audio-classification',
    name: 'Audio Classification',
    description: 'Classify audio into categories',
    category: 'audio',
    icon: 'AudioWaveform',
    inputType: 'audio',
    outputType: 'classification',
    available: true,
    estimatedTime: '3-10s',
    endpoint: 'huggingface-audio',
  },
  {
    id: 'audio-to-audio',
    name: 'Audio to Audio',
    description: 'Transform audio (enhancement, separation)',
    category: 'audio',
    icon: 'AudioLines',
    inputType: 'audio',
    outputType: 'audio',
    available: true,
    estimatedTime: '10-30s',
    endpoint: 'huggingface-audio',
  },
  
  // Multimodal Tasks
  {
    id: 'image-text-to-text',
    name: 'Image+Text to Text',
    description: 'Understand images with text context',
    category: 'multimodal',
    icon: 'ScanText',
    inputType: 'multimodal',
    outputType: 'text',
    available: true,
    estimatedTime: '5-30s',
    endpoint: 'huggingface-multimodal',
  },
  {
    id: 'visual-qa',
    name: 'Visual QA',
    description: 'Answer questions about images',
    category: 'multimodal',
    icon: 'CircleHelp',
    inputType: 'multimodal',
    outputType: 'text',
    available: true,
    estimatedTime: '3-15s',
    endpoint: 'huggingface-multimodal',
  },
  {
    id: 'document-qa',
    name: 'Document QA',
    description: 'Answer questions about documents',
    category: 'multimodal',
    icon: 'FileQuestion',
    inputType: 'multimodal',
    outputType: 'text',
    available: true,
    estimatedTime: '5-20s',
    endpoint: 'huggingface-multimodal',
  },
  {
    id: 'image-to-text',
    name: 'Image to Text',
    description: 'Generate captions for images',
    category: 'multimodal',
    icon: 'FileImage',
    inputType: 'image',
    outputType: 'text',
    available: true,
    estimatedTime: '3-15s',
    endpoint: 'huggingface-multimodal',
  },
  
  // Code Tasks
  {
    id: 'code-generation',
    name: 'Code Generation',
    description: 'Generate code from descriptions',
    category: 'code',
    icon: 'Code2',
    inputType: 'text',
    outputType: 'text',
    available: true,
    estimatedTime: '3-20s',
    endpoint: 'huggingface-text',
  },
  {
    id: 'code-completion',
    name: 'Code Completion',
    description: 'Complete partial code',
    category: 'code',
    icon: 'Braces',
    inputType: 'text',
    outputType: 'text',
    available: true,
    estimatedTime: '2-10s',
    endpoint: 'huggingface-text',
  },
  
  // Video Tasks (Pro Only)
  {
    id: 'text-to-video',
    name: 'Text to Video',
    description: 'Generate videos from text (Pro)',
    category: 'video',
    icon: 'Film',
    inputType: 'text',
    outputType: 'video',
    available: false,
    proOnly: true,
    estimatedTime: '60-300s',
    endpoint: 'huggingface-video',
  },
  {
    id: 'image-to-video',
    name: 'Image to Video',
    description: 'Animate images into videos (Pro)',
    category: 'video',
    icon: 'Clapperboard',
    inputType: 'multimodal',
    outputType: 'video',
    available: false,
    proOnly: true,
    estimatedTime: '60-300s',
    endpoint: 'huggingface-video',
  },
  {
    id: 'video-classification',
    name: 'Video Classification',
    description: 'Classify video content',
    category: 'video',
    icon: 'Tags',
    inputType: 'video',
    outputType: 'classification',
    available: false,
    proOnly: true,
    estimatedTime: '30-120s',
    endpoint: 'huggingface-video',
  },
  
  // Tabular Tasks
  {
    id: 'tabular-classification',
    name: 'Tabular Classification',
    description: 'Classify tabular data',
    category: 'tabular',
    icon: 'Table2',
    inputType: 'file',
    outputType: 'classification',
    available: false,
    proOnly: true,
    estimatedTime: '5-30s',
    endpoint: 'huggingface-tabular',
  },
  {
    id: 'tabular-regression',
    name: 'Tabular Regression',
    description: 'Predict numeric values from tables',
    category: 'tabular',
    icon: 'TrendingUp',
    inputType: 'file',
    outputType: 'json',
    available: false,
    proOnly: true,
    estimatedTime: '5-30s',
    endpoint: 'huggingface-tabular',
  },
];

// Helper Functions
export function getTasksByCategory(category: TaskCategory): TaskDefinition[] {
  return TASK_DEFINITIONS.filter(t => t.category === category);
}

export function getAvailableTasks(): TaskDefinition[] {
  return TASK_DEFINITIONS.filter(t => t.available);
}

export function getTaskById(id: TaskType): TaskDefinition | undefined {
  return TASK_DEFINITIONS.find(t => t.id === id);
}

export function getTaskEndpoint(taskId: TaskType): string {
  const task = getTaskById(taskId);
  return task?.endpoint || 'huggingface-text';
}

export function getCategoryByTask(taskId: TaskType): TaskCategory | undefined {
  const task = getTaskById(taskId);
  return task?.category;
}
