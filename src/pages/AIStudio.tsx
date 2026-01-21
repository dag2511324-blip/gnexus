import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Video, Image, Music, FileText, Code, Sparkles, History,
  BookOpen, Wand2, ArrowLeft, Zap, Scissors, FileOutput,
  Eye, Layers, Table
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIStudioProvider } from '@/contexts/AIStudioContext';
import { ModelShowcase } from '@/components/ai-studio/ModelShowcase';
import { UnifiedGenerator } from '@/components/ai-studio/UnifiedGenerator';
import { GenerationHistory } from '@/components/ai-studio/GenerationHistory';
import { UsageExamples } from '@/components/ai-studio/UsageExamples';
import { EditingTools } from '@/components/ai-studio/EditingTools';
import { DocumentGenerator } from '@/components/ai-studio/DocumentGenerator';
import { CodeDocumentGenerator } from '@/components/ai-studio/CodeDocumentGenerator';
import { TaskSelector } from '@/components/ai-studio/TaskSelector';
import { ThemeToggleSimple } from '@/components/ui/theme-toggle';
import { TaskCategory, TaskType, TASK_CATEGORIES } from '@/lib/tasks';
import { ToolsRegistry } from '@/components/gnexus/ToolsRegistry';
import { GnexusToolsGrid } from '@/components/gnexus/GnexusToolsGrid';

function CategoryTabs({
  activeCategory,
  onCategoryChange,
  selectedTask,
  onTaskSelect
}: {
  activeCategory: TaskCategory;
  onCategoryChange: (category: TaskCategory) => void;
  selectedTask: TaskType | null;
  onTaskSelect: (task: TaskType) => void;
}) {
  const categories = Object.entries(TASK_CATEGORIES).filter(
    ([key]) => key !== 'tabular' // Hide tabular for now
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map(([key, config]) => {
          const isActive = activeCategory === key;
          return (
            <motion.div
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryChange(key as TaskCategory)}
                className={isActive ? `bg-gradient-to-r ${config.color} shadow-lg` : ''}
              >
                {key === 'nlp' && <FileText className="h-4 w-4 mr-1" />}
                {key === 'vision' && <Eye className="h-4 w-4 mr-1" />}
                {key === 'audio' && <Music className="h-4 w-4 mr-1" />}
                {key === 'multimodal' && <Layers className="h-4 w-4 mr-1" />}
                {key === 'code' && <Code className="h-4 w-4 mr-1" />}
                {key === 'video' && <Video className="h-4 w-4 mr-1" />}
                {config.name}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <TaskSelector
        category={activeCategory}
        selectedTask={selectedTask}
        onSelectTask={onTaskSelect}
      />
    </div>
  );
}

function AIStudioContent() {
  const [activeTab, setActiveTab] = useState('generate');
  const [activeCategory, setActiveCategory] = useState<TaskCategory>('nlp');
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-1 to-surface-2 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggleSimple />
      </div>

      {/* Advanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/25 to-accent/15 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/20 to-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating AI particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-primary/40 to-accent/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -80, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Enhanced Header */}
      <header className="border-b border-border/50 bg-card-glass/90 backdrop-blur-xl sticky top-0 z-50 shadow-glass">
        <div className="container-modern">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between py-6"
          >
            <div className="flex items-center gap-6">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link to="/projects">
                  <Button variant="ghost" size="icon" className="hover:bg-card/50 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                className="flex items-center gap-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary-vibrant shadow-glow glow-primary">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent opacity-30 blur-xl"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.div>
                <div>
                  <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-2xl font-bold font-display bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                  >
                    AI Studio
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-sm text-muted-foreground"
                  >
                    All HuggingFace Tasks • Best 3 Models Per Category
                  </motion.p>
                </div>
              </motion.div>
            </div>
            <motion.div
              className="flex items-center gap-3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="gap-2 btn-accent group relative overflow-hidden">
                  <Zap className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                  Quick Generate
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-modern section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <TabsList className="bg-card-glass/60 backdrop-blur-md p-2 flex-wrap h-auto rounded-2xl border border-border/30 shadow-glass">
                {[
                  { value: 'generate', icon: Wand2, label: 'Generate' },
                  { value: 'gnexus-tools', icon: Zap, label: 'Gnexus Tools' },
                  { value: 'tasks', icon: Layers, label: 'All Tasks' },
                  { value: 'edit', icon: Scissors, label: 'Edit' },
                  { value: 'documents', icon: FileOutput, label: 'Documents' },
                  { value: 'models', icon: Sparkles, label: 'Models' },
                  { value: 'history', icon: History, label: 'History' },
                  { value: 'examples', icon: BookOpen, label: 'Examples' }
                ].map((tab, index) => (
                  <motion.div
                    key={tab.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <TabsTrigger
                      value={tab.value}
                      className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-vibrant data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </TabsTrigger>
                  </motion.div>
                ))}
              </TabsList>
            </motion.div>

            <TabsContent value="generate" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <UnifiedGenerator />
              </motion.div>
            </TabsContent>

            <TabsContent value="gnexus-tools" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-card/50 border border-border/50 rounded-lg p-6 backdrop-blur-sm">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-2">Gnexus AI Tools</h2>
                    <p className="text-muted-foreground">
                      Specialized AI tools for design, code, business, and more.
                    </p>
                  </div>
                  <GnexusToolsGrid />
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-card/50 border border-border/50 rounded-lg p-6 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-6"
                  >
                    <h2 className="text-xl font-bold mb-2">Browse All AI Tasks</h2>
                    <p className="text-muted-foreground">
                      Explore all available HuggingFace task types organized by category
                    </p>
                  </motion.div>
                  <CategoryTabs
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    selectedTask={selectedTask}
                    onTaskSelect={setSelectedTask}
                  />
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="edit" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <EditingTools />
              </motion.div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Tabs defaultValue="general" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="general">Documents</TabsTrigger>
                    <TabsTrigger value="code">Code Docs</TabsTrigger>
                  </TabsList>
                  <TabsContent value="general">
                    <DocumentGenerator />
                  </TabsContent>
                  <TabsContent value="code">
                    <CodeDocumentGenerator />
                  </TabsContent>
                </Tabs>
              </motion.div>
            </TabsContent>

            <TabsContent value="models" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <ModelShowcase />
              </motion.div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <GenerationHistory />
              </motion.div>
            </TabsContent>

            <TabsContent value="examples" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <UsageExamples />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}

export default function AIStudio() {
  return (
    <AIStudioProvider>
      <AIStudioContent />
      <ToolsRegistry />
    </AIStudioProvider>
  );
}
