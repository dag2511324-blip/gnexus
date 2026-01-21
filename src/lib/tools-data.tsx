
import {
    Video, FileText, Image, Code, FileCode, Database,
    CheckSquare, FileJson, ArrowRightLeft, FileUser, Mail,
    Share2, Search, Users, Languages, Briefcase, Palette,
    Scale, TrendingUp, LayoutTemplate, MessageSquare,
    Utensils, Dumbbell, Plane, Gift, Lightbulb, Globe,
    BookOpen, Smile, Quote, Book
} from "lucide-react";
import { ToolType } from "@/types/gnexus";

export interface ToolInputField {
    key: string;
    label: string;
    placeholder?: string;
    multiline?: boolean;
    type?: 'text' | 'file' | 'select'; // Added select
    accept?: string;
    options?: { label: string; value: string }[]; // Added options for select
}

export interface ToolDefinition {
    id: ToolType;
    name: string;
    description: string;
    icon: any;
    category: 'media' | 'code' | 'content' | 'business' | 'lifestyle' | 'creative';
    inputFields: ToolInputField[];
}

export const ALL_TOOLS: ToolDefinition[] = [
    // Media & Vision
    {
        id: 'flux-pro-image-gen',
        name: 'Flux Pro Image Gen',
        description: 'Generate high-quality images with Flux Pro (SiliconFlow)',
        icon: Image,
        category: 'media',
        inputFields: [
            { key: 'prompt', label: 'Prompt', placeholder: 'A serene landscape...', multiline: true },
            {
                key: 'image_size',
                label: 'Image Size',
                type: 'select',
                options: [
                    { label: '512x512', value: '512x512' },
                    { label: '768x768', value: '768x768' },
                    { label: '1024x1024', value: '1024x1024' }
                ]
            },
            { key: 'apiKey', label: 'SiliconFlow API Key', placeholder: 'sk-...' }
        ]
    },
    {
        id: 'video-reviewer',
        name: 'Video Reviewer',
        description: 'Analyze video content for summary and anomalies',
        icon: Video,
        category: 'media',
        inputFields: [
            {
                key: 'videoFile',
                label: 'Upload Video',
                type: 'file',
                accept: 'video/*',
                placeholder: 'Select a video file...'
            },
            { key: 'context', label: 'Context (Optional)', placeholder: 'Describe the video context...', multiline: true },
            { key: 'aspects', label: 'Focus Aspects', placeholder: 'e.g., Visual quality, audio clarity' }
        ]
    },
    {
        id: 'text-extractor',
        name: 'Text Extractor',
        description: 'Extract text from images or documents',
        icon: FileText,
        category: 'media',
        inputFields: [
            {
                key: 'imageFile',
                label: 'Upload Image/Doc',
                type: 'file',
                accept: 'image/*,.pdf',
                placeholder: 'Select an image...'
            },
            { key: 'description', label: 'Additional Context', placeholder: 'Any specific areas to focus on...', multiline: true },
            { key: 'format', label: 'Desired Format', placeholder: 'e.g., Raw text, Markdown table' }
        ]
    },
    {
        id: 'image-captioner',
        name: 'Image Captioner',
        description: 'Generate descriptive captions for images',
        icon: Image,
        category: 'media',
        inputFields: [
            {
                key: 'imageFile',
                label: 'Upload Image',
                type: 'file',
                accept: 'image/*',
                placeholder: 'Select an image...'
            },
            { key: 'description', label: 'Additional Context', placeholder: 'Any specific elements to describe...', multiline: true },
            { key: 'tone', label: 'Tone', placeholder: 'e.g., Professional, witty, descriptive' }
        ]
    },

    // Code & Engineering
    {
        id: 'code-reviewer',
        name: 'Code Reviewer',
        description: 'Analyze code for bugs and improvements',
        icon: Code,
        category: 'code',
        inputFields: [
            { key: 'code', label: 'Code Snippet', placeholder: 'Paste code here...', multiline: true },
            { key: 'language', label: 'Language', placeholder: 'e.g., TypeScript, Python' }
        ]
    },
    {
        id: 'regex-generator',
        name: 'Regex Generator',
        description: 'Create regular expressions from natural language',
        icon: FileCode,
        category: 'code',
        inputFields: [
            { key: 'description', label: 'Requirement', placeholder: 'e.g., Match valid email addresses...' },
            { key: 'testCases', label: 'Test Cases', placeholder: 'Strings that should match...' }
        ]
    },
    {
        id: 'sql-generator',
        name: 'SQL Generator',
        description: 'Generate SQL queries from natural language',
        icon: Database,
        category: 'code',
        inputFields: [
            { key: 'query', label: 'Requirement', placeholder: 'e.g., Select all users who signed up last week...', multiline: true },
            { key: 'dialect', label: 'Dialect', placeholder: 'e.g., PostgreSQL, MySQL' }
        ]
    },
    {
        id: 'unit-test-generator',
        name: 'Unit Test Gen',
        description: 'Generate unit tests for your code',
        icon: CheckSquare,
        category: 'code',
        inputFields: [
            { key: 'code', label: 'Code to Test', placeholder: 'Paste code here...', multiline: true },
            { key: 'framework', label: 'Testing Framework', placeholder: 'e.g., Jest, PyTest' }
        ]
    },
    {
        id: 'json-formatter',
        name: 'JSON Formatter',
        description: 'Validate and format JSON data',
        icon: FileJson,
        category: 'code',
        inputFields: [
            { key: 'json', label: 'JSON Data', placeholder: 'Paste JSON here...', multiline: true }
        ]
    },
    {
        id: 'code-converter',
        name: 'Code Converter',
        description: 'Convert code between languages',
        icon: ArrowRightLeft,
        category: 'code',
        inputFields: [
            { key: 'code', label: 'Source Code', placeholder: 'Paste code here...', multiline: true },
            { key: 'sourceLang', label: 'Source Language', placeholder: 'e.g., Python' },
            { key: 'targetLang', label: 'Target Language', placeholder: 'e.g., TypeScript' }
        ]
    },

    // Content & Productivity
    {
        id: 'resume-optimizer',
        name: 'Resume Optimizer',
        description: 'Optimize resume for specific roles',
        icon: FileUser,
        category: 'content',
        inputFields: [
            { key: 'resume', label: 'Resume Content', placeholder: 'Paste resume text...', multiline: true },
            { key: 'role', label: 'Target Role', placeholder: 'e.g., Senior Frontend Engineer' }
        ]
    },
    {
        id: 'email-drafter',
        name: 'Email Drafter',
        description: 'Draft professional emails',
        icon: Mail,
        category: 'content',
        inputFields: [
            { key: 'purpose', label: 'Purpose', placeholder: 'e.g., Project update, Sick leave' },
            { key: 'audience', label: 'Audience', placeholder: 'e.g., Client, Manager' },
            { key: 'keyPoints', label: 'Key Points', placeholder: 'Points to include...', multiline: true }
        ]
    },
    {
        id: 'social-media-post',
        name: 'Social Media Post',
        description: 'Create engaging social media content',
        icon: Share2,
        category: 'content',
        inputFields: [
            { key: 'topic', label: 'Topic', placeholder: 'e.g., New product launch' },
            { key: 'platform', label: 'Platform', placeholder: 'e.g., Twitter, LinkedIn' }
        ]
    },
    {
        id: 'seo-analyzer',
        name: 'SEO Analyzer',
        description: 'Analyze content for SEO optimization',
        icon: Search,
        category: 'content',
        inputFields: [
            { key: 'content', label: 'Content', placeholder: 'Paste content to analyze...', multiline: true },
            { key: 'keyword', label: 'Target Keyword', placeholder: 'e.g., AI design tools' }
        ]
    },
    {
        id: 'meeting-summarizer',
        name: 'Meeting Summary',
        description: 'Summarize meeting transcripts',
        icon: Users,
        category: 'content',
        inputFields: [
            { key: 'transcript', label: 'Transcript', placeholder: 'Paste meeting transcript...', multiline: true }
        ]
    },
    {
        id: 'language-translator',
        name: 'Translator',
        description: 'Translate text with cultural nuance',
        icon: Languages,
        category: 'content',
        inputFields: [
            { key: 'text', label: 'Text', placeholder: 'Text to translate...', multiline: true },
            { key: 'sourceLang', label: 'From', placeholder: 'e.g., English' },
            { key: 'targetLang', label: 'To', placeholder: 'e.g., Spanish' }
        ]
    },
    {
        id: 'job-description-generator',
        name: 'Job Description',
        description: 'Create detailed job descriptions',
        icon: Briefcase,
        category: 'content',
        inputFields: [
            { key: 'title', label: 'Job Title', placeholder: 'e.g., Product Manager' },
            { key: 'company', label: 'Company Context', placeholder: 'e.g., Fast-paced startup...' }
        ]
    },

    // Business & Legal
    {
        id: 'palette-generator',
        name: 'Palette Gen',
        description: 'Generate color palettes from mood',
        icon: Palette,
        category: 'creative',
        inputFields: [
            { key: 'mood', label: 'Mood/Vibe', placeholder: 'e.g., Calm, Energetic, Corporate' },
            { key: 'baseColor', label: 'Base Color', placeholder: 'e.g., Blue, #0066FF' }
        ]
    },
    {
        id: 'legal-contract-review',
        name: 'Contract Review',
        description: 'Scan contracts for risks (AI)',
        icon: Scale,
        category: 'business',
        inputFields: [
            { key: 'text', label: 'Contract Text', placeholder: 'Paste contract text...', multiline: true },
            { key: 'focus', label: 'Focus Area', placeholder: 'e.g., IP rights, Termination clauses' }
        ]
    },
    {
        id: 'swot-analysis',
        name: 'SWOT Analysis',
        description: 'Generate SWOT analysis',
        icon: TrendingUp,
        category: 'business',
        inputFields: [
            { key: 'subject', label: 'Subject', placeholder: 'e.g., My new mobile app' },
            { key: 'context', label: 'Context', placeholder: 'Market details...' }
        ]
    },
    {
        id: 'business-model-canvas',
        name: 'Business Canvas',
        description: 'Generate Business Model Canvas',
        icon: LayoutTemplate,
        category: 'business',
        inputFields: [
            { key: 'idea', label: 'Business Idea', placeholder: 'Describe your business idea...', multiline: true }
        ]
    },
    {
        id: 'interview-prep',
        name: 'Interview Prep',
        description: 'Generate interview questions',
        icon: MessageSquare,
        category: 'business',
        inputFields: [
            { key: 'role', label: 'Role', placeholder: 'e.g., React Developer' },
            { key: 'level', label: 'Level', placeholder: 'e.g., Senior' }
        ]
    },

    // Lifestyle
    {
        id: 'recipe-generator',
        name: 'Recipe Gen',
        description: 'Create recipes from ingredients',
        icon: Utensils,
        category: 'lifestyle',
        inputFields: [
            { key: 'ingredients', label: 'Available Ingredients', placeholder: 'e.g., Chicken, rice, broccoli' },
            { key: 'constraints', label: 'Dietary Constraints', placeholder: 'e.g., Gluten-free, Keto' }
        ]
    },
    {
        id: 'workout-planner',
        name: 'Workout Planner',
        description: 'Create personalized workout plans',
        icon: Dumbbell,
        category: 'lifestyle',
        inputFields: [
            { key: 'goal', label: 'Fitness Goal', placeholder: 'e.g., Muscle gain, Weight loss' },
            { key: 'equipment', label: 'Equipment', placeholder: 'e.g., Gym access, Dumbbells only' }
        ]
    },
    {
        id: 'travel-planner',
        name: 'Travel Planner',
        description: 'Plan your perfect trip',
        icon: Plane,
        category: 'lifestyle',
        inputFields: [
            { key: 'destination', label: 'Destination', placeholder: 'e.g., Tokyo, Japan' },
            { key: 'days', label: 'Duration (days)', placeholder: 'e.g., 7' },
            { key: 'budget', label: 'Budget', placeholder: 'e.g., Moderate' }
        ]
    },
    {
        id: 'gift-suggester',
        name: 'Gift Suggester',
        description: 'Get gift ideas for anyone',
        icon: Gift,
        category: 'lifestyle',
        inputFields: [
            { key: 'recipient', label: 'Recipient Description', placeholder: 'e.g., Tech-savvy dad who likes coffee' },
            { key: 'budget', label: 'Budget', placeholder: 'e.g., $50-100' }
        ]
    },

    // Creative
    {
        id: 'slogan-generator',
        name: 'Slogan Gen',
        description: 'Catchy slogans for your brand',
        icon: Lightbulb,
        category: 'creative',
        inputFields: [
            { key: 'brand', label: 'Brand Name', placeholder: 'e.g., Gnexus' },
            { key: 'keywords', label: 'Keywords', placeholder: 'e.g., Innovation, Speed, AI' }
        ]
    },
    {
        id: 'domain-namer',
        name: 'Domain Namer',
        description: 'Generate available domain names',
        icon: Globe,
        category: 'creative',
        inputFields: [
            { key: 'keywords', label: 'Keywords', placeholder: 'e.g., Design, AI, Studio' },
            { key: 'tlds', label: 'Preferred TLDs', placeholder: 'e.g., .com, .io, .ai' }
        ]
    },
    {
        id: 'eli5-explainer',
        name: 'ELI5 Explainer',
        description: 'Explain complex topics simply',
        icon: BookOpen,
        category: 'creative',
        inputFields: [
            { key: 'topic', label: 'Topic', placeholder: 'e.g., Quantum Computing' },
            { key: 'complexity', label: 'Level', placeholder: 'e.g., 5-year old, Teenager' }
        ]
    },
    {
        id: 'sentiment-analyzer',
        name: 'Sentiment',
        description: 'Analyze emotional tone of text',
        icon: Smile,
        category: 'creative',
        inputFields: [
            { key: 'text', label: 'Text', placeholder: 'Paste text to analyze...', multiline: true }
        ]
    },
    {
        id: 'citation-generator',
        name: 'Citation Gen',
        description: 'Generate citations for sources',
        icon: Quote,
        category: 'creative',
        inputFields: [
            { key: 'url', label: 'Source URL/Title', placeholder: 'e.g., https://example.com' },
            { key: 'format', label: 'Format', placeholder: 'e.g., APA, MLA, Chicago' }
        ]
    },
    {
        id: 'story-plot-generator',
        name: 'Story Plotter',
        description: 'Generate creative story plots',
        icon: Book,
        category: 'creative',
        inputFields: [
            { key: 'genre', label: 'Genre', placeholder: 'e.g., Sci-fi, Thriller' },
            { key: 'theme', label: 'Theme', placeholder: 'e.g., Betrayal, Discovery' }
        ]
    }
];
