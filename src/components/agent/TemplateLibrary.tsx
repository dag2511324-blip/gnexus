/**
 * Template Library - Pre-built Workflow Templates
 * Helps users get started quickly with common patterns
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Code,
    Palette,
    Brain,
    TrendingUp,
    FileText,
    Search,
    Download,
    Star,
    Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface Template {
    id: string;
    title: string;
    description: string;
    category: 'development' | 'content' | 'research' | 'project';
    icon: any;
    nodes: number;
    timeEstimate: string;
    popularity: number;
    preview: string;
}

const templates: Template[] = [
    // Development Templates
    {
        id: 'feature-planning',
        title: 'Feature Planning',
        description: 'Plan and architect new software features from requirements to deployment',
        category: 'development',
        icon: Code,
        nodes: 6,
        timeEstimate: '2-3 hours',
        popularity: 95,
        preview: 'Requirements → Design → Implementation → Testing → Review → Deploy',
    },
    {
        id: 'bug-fix-workflow',
        title: 'Bug Fix Workflow',
        description: 'Systematic debugging and resolution process',
        category: 'development',
        icon: Code,
        nodes: 5,
        timeEstimate: '1-2 hours',
        popularity: 88,
        preview: 'Reproduce → Investigate → Fix → Test → Document',
    },
    {
        id: 'code-review-process',
        title: 'Code Review Process',
        description: 'Comprehensive code review checklist and workflow',
        category: 'development',
        icon: Code,
        nodes: 4,
        timeEstimate: '30-60 min',
        popularity: 92,
        preview: 'Review Code → Test → Feedback → Approval',
    },

    // Content Creation Templates
    {
        id: 'blog-post-workflow',
        title: 'Blog Post Creation',
        description: 'From research to publication workflow',
        category: 'content',
        icon: FileText,
        nodes: 7,
        timeEstimate: '3-4 hours',
        popularity: 85,
        preview: 'Research → Outline → Draft → Edit → Images → SEO → Publish',
    },
    {
        id: 'video-production',
        title: 'Video Production',
        description: 'Complete video creation pipeline',
        category: 'content',
        icon: Palette,
        nodes: 8,
        timeEstimate: '1-2 days',
        popularity: 78,
        preview: 'Concept → Script → Shoot → Edit → Sound → Graphics → Review → Publish',
    },
    {
        id: 'social-media-campaign',
        title: 'Social Media Campaign',
        description: 'Plan and execute social media campaigns',
        category: 'content',
        icon: TrendingUp,
        nodes: 6,
        timeEstimate: '2-3 hours',
        popularity: 90,
        preview: 'Strategy → Content → Schedule → Launch → Monitor → Analyze',
    },

    // Research Templates
    {
        id: 'literature-review',
        title: 'Literature Review',
        description: 'Systematic literature review process',
        category: 'research',
        icon: Brain,
        nodes: 5,
        timeEstimate: '1-2 weeks',
        popularity: 72,
        preview: 'Search → Screen → Extract → Synthesize → Report',
    },
    {
        id: 'market-research',
        title: 'Market Research',
        description: 'Comprehensive market analysis workflow',
        category: 'research',
        icon: TrendingUp,
        nodes: 6,
        timeEstimate: '3-5 days',
        popularity: 82,
        preview: 'Define → Research → Analyze → Insights → Report → Present',
    },

    // Project Management Templates
    {
        id: 'sprint-planning',
        title: 'Sprint Planning',
        description: 'Agile sprint planning workflow',
        category: 'project',
        icon: Code,
        nodes: 5,
        timeEstimate: '2-3 hours',
        popularity: 93,
        preview: 'Backlog → Estimate → Commit → Plan → Kickoff',
    },
    {
        id: 'product-roadmap',
        title: 'Product Roadmap',
        description: 'Strategic product planning',
        category: 'project',
        icon: TrendingUp,
        nodes: 7,
        timeEstimate: '1-2 days',
        popularity: 87,
        preview: 'Vision → Research → Prioritize → Timeline → Dependencies → Review → Share',
    },
];

const categoryConfig = {
    development: { label: 'Development', color: '#f97316', icon: Code },
    content: { label: 'Content', color: '#9D4EDD', icon: Palette },
    research: { label: 'Research', color: '#00D9FF', icon: Brain },
    project: { label: 'Project', color: '#06FFA5', icon: TrendingUp },
};

export function TemplateLibrary() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="w-full h-full bg-[#0a0a0a] rounded-xl border border-white/10 p-6 overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">📚 Template Library</h2>
                <p className="text-sm text-gray-400">
                    Pre-built workflows to help you get started quickly
                </p>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                />
            </div>

            {/* Category Filter */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedCategory(null)}
                    className={`rounded-full ${!selectedCategory
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    All ({templates.length})
                </Button>
                {Object.entries(categoryConfig).map(([key, config]) => {
                    const count = templates.filter(t => t.category === key).length;
                    const Icon = config.icon;
                    return (
                        <Button
                            key={key}
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedCategory(key)}
                            className={`rounded-full ${selectedCategory === key
                                    ? 'border'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                            style={{
                                backgroundColor: selectedCategory === key ? `${config.color}20` : undefined,
                                borderColor: selectedCategory === key ? `${config.color}80` : undefined,
                                color: selectedCategory === key ? config.color : undefined,
                            }}
                        >
                            <Icon className="w-3 h-3 mr-2" />
                            {config.label} ({count})
                        </Button>
                    );
                })}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => {
                    const category = categoryConfig[template.category];
                    const Icon = category.icon;

                    return (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            className="bg-white/5 rounded-lg border border-white/10 p-4 hover:border-white/20 transition-all cursor-pointer group"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{
                                        backgroundColor: `${category.color}20`,
                                        borderColor: `${category.color}40`,
                                        borderWidth: '1px'
                                    }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: category.color }} />
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                    {template.popularity}
                                </div>
                            </div>

                            {/* Title & Description */}
                            <h3 className="text-sm font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                                {template.title}
                            </h3>
                            <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                                {template.description}
                            </p>

                            {/* Preview */}
                            <div className="mb-3 p-2 bg-black/30 rounded text-[10px] text-gray-500 font-mono">
                                {template.preview}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                                <span>{template.nodes} nodes</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {template.timeEstimate}
                                </span>
                            </div>

                            {/* Action */}
                            <Button
                                size="sm"
                                className="w-full bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/50 text-white"
                            >
                                <Download className="w-3 h-3 mr-2" />
                                Use Template
                            </Button>
                        </motion.div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No templates found</p>
                    <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
}
