import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Sparkles, Zap, CheckCircle, AlertCircle,
  Clock, TrendingUp, Star, Filter, Search,
  FileText, Code, Image, Music, Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ALL_MODELS, getAvailableModels, getRecommendedModels, AIModelFull, Modality } from '@/lib/models';

interface FreeModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  taskType?: string;
  modality?: Modality;
}

export function FreeModelSelector({ selectedModel, onModelSelect, taskType, modality }: FreeModelSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFree, setShowOnlyFree] = useState(true);
  const [sortBy, setSortBy] = useState<'speed' | 'quality' | 'name'>('quality');
  const [isLoading, setIsLoading] = useState(false);

  // Filter models based on criteria
  const filteredModels = ALL_MODELS.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModality = !modality || model.modality === modality;
    const isFree = showOnlyFree ? model.available !== 'pro-only' : true;
    const matchesTask = !taskType || model.taskType === taskType;

    return matchesSearch && matchesModality && isFree && matchesTask;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'speed':
        return (a.estimatedTime || '').localeCompare(b.estimatedTime || '');
      case 'quality':
        return (a.rank || 999) - (b.rank || 999);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const getModalityIcon = (modality: Modality) => {
    switch (modality) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'code': return <Code className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getAvailabilityBadge = (model: AIModelFull) => {
    switch (model.available) {
      case 'available':
        return <Badge className="bg-success/20 text-success border border-success/30">Free</Badge>;
      case 'loading':
        return <Badge className="bg-warning/20 text-warning border border-warning/30">Loading</Badge>;
      case 'pro-only':
        return <Badge className="bg-destructive/20 text-destructive border border-destructive/30">Pro Only</Badge>;
      default:
        return <Badge variant="secondary">Unavailable</Badge>;
    }
  };

  const getRankBadge = (rank?: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-amber-500/20 text-amber-700 border border-amber-500/30">🏆 #1</Badge>;
      case 2:
        return <Badge className="bg-gray-500/20 text-gray-700 border border-gray-500/30">🥈 #2</Badge>;
      case 3:
        return <Badge className="bg-orange-500/20 text-orange-700 border border-orange-500/30">🥉 #3</Badge>;
      default:
        return null;
    }
  };

  const simulateModelLoad = async (modelId: string) => {
    setIsLoading(true);

    // Simulate model loading/checking
    await new Promise(resolve => setTimeout(resolve, 1500));

    onModelSelect(modelId);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search free models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-modern"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'speed' | 'quality' | 'name')}>
              <SelectTrigger className="input-modern">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quality">Best Quality</SelectItem>
                <SelectItem value="speed">Fastest</SelectItem>
                <SelectItem value="name">Alphabetical</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Switch
                id="free-only"
                checked={showOnlyFree}
                onCheckedChange={setShowOnlyFree}
              />
              <label htmlFor="free-only" className="text-sm font-medium cursor-pointer">
                Free Only
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Brain className="h-4 w-4" />
          <span>{filteredModels.length} free models available</span>
        </div>
      </div>

      {/* Models grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="relative group"
          >
            <Card className={`h-full cursor-pointer transition-all duration-300 hover:shadow-elevated ${selectedModel === model.id ? 'ring-2 ring-primary/50 bg-card-elevated' : 'card-glass'
              }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${model.color}`}>
                      {getModalityIcon(model.modality)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold line-clamp-1">{model.name}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">{model.description}</CardDescription>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {getRankBadge(model.rank)}
                    {getAvailabilityBadge(model)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {/* Model stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <TooltipProvider>
                      <TooltipTrigger>
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs font-medium">{model.estimatedTime}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Estimated generation time</p>
                      </TooltipContent>
                    </TooltipProvider>
                  </div>

                  <div className="text-center">
                    <TooltipProvider>
                      <TooltipTrigger>
                        <div className="flex items-center justify-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span className="text-xs font-medium">{model.provider}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Provider</p>
                      </TooltipContent>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Capabilities */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Capabilities:</p>
                  <div className="flex flex-wrap gap-1">
                    {model.capabilities.slice(0, 3).map((capability, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                    {model.capabilities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{model.capabilities.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Model parameters preview */}
                {model.parameters.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Parameters:</p>
                    <div className="space-y-1">
                      {model.parameters.slice(0, 2).map((param, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{param.label}:</span>
                          <span className="font-mono bg-muted px-1 rounded">{param.default}</span>
                        </div>
                      ))}
                      {model.parameters.length > 2 && (
                        <div className="text-xs text-center text-muted-foreground">
                          +{model.parameters.length - 2} more parameters
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-2 border-t">
                  <TooltipProvider>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          // View details
                        }}
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View model details and examples</p>
                    </TooltipContent>
                  </TooltipProvider>

                  <TooltipProvider>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="flex-1 btn-primary"
                        onClick={() => simulateModelLoad(model.id)}
                        disabled={isLoading || model.available !== 'available'}
                      >
                        {isLoading && selectedModel === model.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                        ) : (
                          <>
                            {model.available === 'available' ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Select
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {model.available === 'loading' ? 'Loading...' : 'Unavailable'}
                              </>
                            )}
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {model.available === 'available'
                          ? 'Select this model'
                          : model.available === 'loading'
                            ? 'Model is currently loading'
                            : 'This model requires Pro subscription'
                        }
                      </p>
                    </TooltipContent>
                  </TooltipProvider>
                </div>

                {/* Loading overlay */}
                {isLoading && selectedModel === model.id && (
                  <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mb-2"></div>
                      <p className="text-sm font-medium">Loading model...</p>
                      <Progress value={75} className="w-32 h-2 mt-2" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {filteredModels.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No models found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters to find available models
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setShowOnlyFree(false);
              setSortBy('quality');
            }}
          >
            Clear filters
          </Button>
        </motion.div>
      )}
    </div>
  );
}
