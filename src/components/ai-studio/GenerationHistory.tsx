import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Image, Music, FileText, Code, Trash2, Download, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGenerationHistory, GenerationHistoryItem } from '@/hooks/useGenerationHistory';
import { Modality } from '@/lib/models';
import { formatDistanceToNow } from 'date-fns';

const MODALITY_ICONS: Record<Modality, typeof Video> = {
  video: Video,
  image: Image,
  audio: Music,
  text: FileText,
  code: Code,
};

function HistoryCard({ item, onDelete }: { item: GenerationHistoryItem; onDelete: () => void }) {
  const Icon = MODALITY_ICONS[item.modality];
  
  const handleDownload = () => {
    if (!item.resultUrl) return;
    const link = document.createElement('a');
    link.href = item.resultUrl;
    link.download = `${item.modality}-${item.id}.${item.resultType?.split('/')[1] || 'bin'}`;
    link.click();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card className="bg-card/50 border-border/50 overflow-hidden group">
        <CardContent className="p-0">
          {/* Preview */}
          <div className="relative aspect-square bg-muted">
            {item.status === 'completed' && item.resultUrl ? (
              <>
                {item.modality === 'image' && (
                  <img src={item.resultUrl} alt="" className="w-full h-full object-cover" />
                )}
                {item.modality === 'video' && (
                  <video src={item.resultUrl} className="w-full h-full object-cover" />
                )}
                {(item.modality === 'audio' || item.modality === 'text' || item.modality === 'code') && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </>
            ) : item.status === 'failed' ? (
              <div className="w-full h-full flex items-center justify-center text-destructive">
                <AlertCircle className="h-12 w-12" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon className="h-12 w-12 text-muted-foreground animate-pulse" />
              </div>
            )}
            
            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {item.resultUrl && (
                <Button size="sm" variant="secondary" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Info */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {item.modelName}
              </Badge>
              <Badge variant={item.status === 'completed' ? 'default' : item.status === 'failed' ? 'destructive' : 'secondary'}>
                {item.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{item.prompt}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(item.createdAt, { addSuffix: true })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function GenerationHistory() {
  const [filter, setFilter] = useState<'all' | Modality>('all');
  const { history, isLoading, deleteHistoryItem, clearAllHistory } = useGenerationHistory();
  
  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(h => h.modality === filter);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Generation History</h2>
          <p className="text-muted-foreground">{history.length} generations</p>
        </div>
        {history.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAllHistory}>
            Clear All
          </Button>
        )}
      </div>
      
      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | Modality)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredHistory.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              onDelete={() => deleteHistoryItem(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No generations yet. Start creating!</p>
        </div>
      )}
    </div>
  );
}
