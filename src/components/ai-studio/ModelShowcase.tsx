import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Image, Music, FileText, Code, Star, Clock, Zap, Trophy, Medal, Award, Eye, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ALL_MODELS, Modality, AIModelFull, getRankBadge } from '@/lib/models';
import { TaskCategory, TASK_CATEGORIES } from '@/lib/tasks';

const MODALITY_ICONS: Record<Modality, typeof Video> = {
  video: Video,
  image: Image,
  audio: Music,
  text: FileText,
  code: Code,
};

const CATEGORY_ICONS: Record<TaskCategory, typeof Video> = {
  nlp: FileText,
  vision: Eye,
  audio: Music,
  multimodal: Layers,
  code: Code,
  video: Video,
  tabular: FileText,
};

const LICENSE_COLORS: Record<string, string> = {
  'Apache 2.0': 'bg-green-500/20 text-green-400 border-green-500/30',
  'MIT': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'OpenRAIL': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'CC-BY-NC': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Llama 3': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Commercial': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const RANK_ICONS: Record<number, typeof Trophy> = {
  1: Trophy,
  2: Medal,
  3: Award,
};

const RANK_COLORS: Record<number, string> = {
  1: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  2: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
  3: 'bg-amber-600/20 text-amber-500 border-amber-600/30',
};

function ModelCard({ model }: { model: AIModelFull }) {
  const Icon = MODALITY_ICONS[model.modality];
  const RankIcon = model.rank ? RANK_ICONS[model.rank] : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${model.color}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-1">
              {model.rank && RankIcon && (
                <Badge variant="outline" className={RANK_COLORS[model.rank]}>
                  <RankIcon className="h-3 w-3 mr-1" />
                  #{model.rank}
                </Badge>
              )}
              {model.recommended && !model.rank && (
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  <Star className="h-3 w-3 mr-1" />
                  Top Pick
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className="text-lg mt-2">{model.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{model.provider}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">{model.description}</p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{model.estimatedTime}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={LICENSE_COLORS[model.license] || 'bg-muted'}>
              {model.license}
            </Badge>
            {model.available === 'pro-only' && (
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Pro Only
              </Badge>
            )}
            {model.available === 'loading' && (
              <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                Cold Start
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-primary font-medium flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {model.advantage}
          </p>
          
          {model.taskType && (
            <Badge variant="secondary" className="text-xs">
              {model.taskType}
            </Badge>
          )}
          
          <div className="flex flex-wrap gap-1 pt-2">
            {model.capabilities.slice(0, 3).map((cap, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {cap}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

type FilterType = 'all' | Modality | TaskCategory;

export function ModelShowcase() {
  const [filter, setFilter] = useState<FilterType>('all');
  
  const filteredModels = filter === 'all' 
    ? ALL_MODELS 
    : ALL_MODELS.filter(m => {
        // Check modality
        if (m.modality === filter) return true;
        // Check task category
        const categoryTasks = TASK_CATEGORIES[filter as TaskCategory]?.tasks || [];
        if (m.taskType && categoryTasks.includes(m.taskType)) return true;
        return false;
      });
  
  // Sort by rank (ranked models first, then by rank number)
  const sortedModels = [...filteredModels].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.rank) return -1;
    if (b.rank) return 1;
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    return 0;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Models</h2>
          <p className="text-muted-foreground">
            {sortedModels.length} models • Best 3 per category ranked
          </p>
        </div>
      </div>
      
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All ({ALL_MODELS.length})</TabsTrigger>
          <TabsTrigger value="nlp" className="gap-1">
            <FileText className="h-3 w-3" />
            NLP
          </TabsTrigger>
          <TabsTrigger value="vision" className="gap-1">
            <Eye className="h-3 w-3" />
            Vision
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-1">
            <Music className="h-3 w-3" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="multimodal" className="gap-1">
            <Layers className="h-3 w-3" />
            Multimodal
          </TabsTrigger>
          <TabsTrigger value="code" className="gap-1">
            <Code className="h-3 w-3" />
            Code
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-1">
            <Video className="h-3 w-3" />
            Video
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedModels.map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}
      </div>
      
      {sortedModels.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No models found for this category
        </div>
      )}
    </div>
  );
}
