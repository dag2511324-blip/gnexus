import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, FileText, Languages, HelpCircle, Tags, Puzzle, GitCompare,
  ImagePlus, Wand2, ScanSearch, Box, Layers3, Grid2X2,
  Volume2, Mic, AudioWaveform, AudioLines,
  ScanText, CircleHelp, FileQuestion, FileImage,
  Code2, Braces,
  Film, Clapperboard, Table2, TrendingUp,
  Lock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskType, TaskDefinition, TaskCategory, TASK_CATEGORIES, getTasksByCategory } from '@/lib/tasks';

const TASK_ICONS: Record<string, React.ElementType> = {
  'MessageSquare': MessageSquare,
  'FileText': FileText,
  'Languages': Languages,
  'HelpCircle': HelpCircle,
  'Tags': Tags,
  'Puzzle': Puzzle,
  'GitCompare': GitCompare,
  'ImagePlus': ImagePlus,
  'Wand2': Wand2,
  'ScanSearch': ScanSearch,
  'Box': Box,
  'Layers3': Layers3,
  'Grid2X2': Grid2X2,
  'Volume2': Volume2,
  'Mic': Mic,
  'AudioWaveform': AudioWaveform,
  'AudioLines': AudioLines,
  'ScanText': ScanText,
  'CircleHelp': CircleHelp,
  'FileQuestion': FileQuestion,
  'FileImage': FileImage,
  'Code2': Code2,
  'Braces': Braces,
  'Film': Film,
  'Clapperboard': Clapperboard,
  'Table2': Table2,
  'TrendingUp': TrendingUp,
};

interface TaskCardProps {
  task: TaskDefinition;
  isSelected: boolean;
  onClick: () => void;
}

function TaskCard({ task, isSelected, onClick }: TaskCardProps) {
  const IconComponent = TASK_ICONS[task.icon] || MessageSquare;
  const categoryColor = TASK_CATEGORIES[task.category]?.color || 'from-gray-500 to-gray-600';
  
  return (
    <motion.div
      whileHover={{ scale: task.available ? 1.02 : 1 }}
      whileTap={{ scale: task.available ? 0.98 : 1 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card 
        className={`cursor-pointer transition-all border-2 ${
          isSelected 
            ? 'border-primary bg-primary/10' 
            : task.available 
              ? 'border-border/50 hover:border-primary/50 bg-card/50' 
              : 'border-border/30 bg-muted/30 opacity-60'
        }`}
        onClick={task.available ? onClick : undefined}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${categoryColor}`}>
              <IconComponent className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center gap-1">
              {task.proOnly && (
                <Badge variant="outline" className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                  <Lock className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              )}
              {!task.available && !task.proOnly && (
                <Badge variant="outline" className="text-xs">
                  Soon
                </Badge>
              )}
            </div>
          </div>
          <h3 className="font-semibold text-sm mb-1">{task.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            ⏱ {task.estimatedTime}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface TaskSelectorProps {
  category: TaskCategory;
  selectedTask: TaskType | null;
  onSelectTask: (task: TaskType) => void;
}

export function TaskSelector({ category, selectedTask, onSelectTask }: TaskSelectorProps) {
  const tasks = getTasksByCategory(category);
  const categoryInfo = TASK_CATEGORIES[category];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${categoryInfo.color}`}>
          <span className="text-white text-sm">{categoryInfo.name}</span>
        </div>
        <p className="text-sm text-muted-foreground">{categoryInfo.description}</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <TaskCard 
              task={task} 
              isSelected={selectedTask === task.id}
              onClick={() => onSelectTask(task.id)} 
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default TaskSelector;
