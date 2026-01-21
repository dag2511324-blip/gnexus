import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Zap, Settings, Play, Pause, RotateCcw, Download, Upload,
  BarChart3, Activity, Clock, TrendingUp, AlertCircle, CheckCircle,
  Layers, Cpu, HardDrive, MemoryStick, Thermometer,
  FileText, Code, Image, Music, Video, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface TrainingJob {
  id: string;
  name: string;
  model: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  epoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
  learningRate: number;
  startTime: string;
  estimatedTime: string;
  metrics: {
    gpuUsage: number;
    memoryUsage: number;
    temperature: number;
  };
}

interface ModelConfig {
  name: string;
  type: 'text' | 'code' | 'image' | 'audio' | 'video';
  baseModel: string;
  description: string;
  parameters: number;
  trainingData: string;
  fineTuningMethod: 'lora' | 'qlora' | 'full';
}

export function AITrainer() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('jobs');
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([
    {
      id: '1',
      name: 'Custom Code Assistant',
      model: 'Qwen2.5-Coder-1.5B',
      status: 'running',
      progress: 65,
      epoch: 13,
      totalEpochs: 20,
      loss: 0.234,
      accuracy: 0.892,
      learningRate: 0.0001,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      estimatedTime: '45 min',
      metrics: {
        gpuUsage: 87,
        memoryUsage: 64,
        temperature: 72,
      },
    },
    {
      id: '2',
      name: 'Creative Writing Model',
      model: 'Phi-3-Mini',
      status: 'completed',
      progress: 100,
      epoch: 10,
      totalEpochs: 10,
      loss: 0.156,
      accuracy: 0.945,
      learningRate: 0.00005,
      startTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      estimatedTime: 'Completed',
      metrics: {
        gpuUsage: 0,
        memoryUsage: 0,
        temperature: 45,
      },
    },
  ]);

  const [newJobConfig, setNewJobConfig] = useState<ModelConfig>({
    name: '',
    type: 'text',
    baseModel: '',
    description: '',
    parameters: 1000,
    trainingData: '',
    fineTuningMethod: 'lora',
  });

  const [isTraining, setIsTraining] = useState(false);

  const modelOptions = {
    text: [
      'microsoft/Phi-3-mini-4k-instruct',
      'google/gemma-2-2b-it',
      'meta-llama/Llama-3.2-1B-Instruct',
      'Qwen/Qwen2.5-1.5B-Instruct',
    ],
    code: [
      'Qwen/Qwen2.5-Coder-1.5B-Instruct',
      'bigcode/starcoder2-3b',
      'codellama/CodeLlama-7b-Instruct-hf',
    ],
    image: [
      'stabilityai/stable-diffusion-xl-base-1.0',
      'black-forest-labs/FLUX.1-schnell',
      'runwayml/stable-diffusion-v1-5',
    ],
    audio: [
      'openai/whisper-large-v3',
      'facebook/mms-tts-eng',
      'suno/bark-small',
    ],
    video: [
      'pyramid-flow/pyramid-flow-sd3',
      'Wan-AI/Wan2.2-T2V-14B',
      'guoyww/animatediff',
    ],
  };

  const startTraining = () => {
    if (!newJobConfig.name || !newJobConfig.baseModel) {
      toast({
        title: 'Missing Configuration',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const newJob: TrainingJob = {
      id: Date.now().toString(),
      name: newJobConfig.name,
      model: newJobConfig.baseModel,
      status: 'running',
      progress: 0,
      epoch: 0,
      totalEpochs: 10,
      loss: 1.0,
      accuracy: 0.0,
      learningRate: 0.0001,
      startTime: new Date().toISOString(),
      estimatedTime: '2-3 hours',
      metrics: {
        gpuUsage: 95,
        memoryUsage: 78,
        temperature: 75,
      },
    };

    setTrainingJobs(prev => [newJob, ...prev]);
    setIsTraining(true);

    toast({
      title: 'Training Started',
      description: `${newJobConfig.name} training has begun`,
    });

    // Simulate training progress
    simulateTraining(newJob.id);
  };

  const simulateTraining = (jobId: string) => {
    const interval = setInterval(() => {
      setTrainingJobs(prev => prev.map(job => {
        if (job.id !== jobId) return job;

        const newProgress = Math.min(job.progress + Math.random() * 5, 100);
        const newEpoch = Math.floor(newProgress / 10);
        const newLoss = Math.max(0.1, job.loss - Math.random() * 0.05);
        const newAccuracy = Math.min(0.99, job.accuracy + Math.random() * 0.02);

        if (newProgress >= 100) {
          clearInterval(interval);
          return {
            ...job,
            status: 'completed' as const,
            progress: 100,
            epoch: job.totalEpochs,
            loss: newLoss,
            accuracy: newAccuracy,
            estimatedTime: 'Completed',
            metrics: { gpuUsage: 0, memoryUsage: 0, temperature: 45 },
          };
        }

        return {
          ...job,
          progress: newProgress,
          epoch: newEpoch,
          loss: newLoss,
          accuracy: newAccuracy,
          metrics: {
            gpuUsage: 85 + Math.random() * 10,
            memoryUsage: 60 + Math.random() * 20,
            temperature: 70 + Math.random() * 10,
          },
        };
      }));
    }, 2000);
  };

  const pauseTraining = (jobId: string) => {
    setTrainingJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, status: 'idle' as const } : job
    ));
  };

  const resumeTraining = (jobId: string) => {
    setTrainingJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, status: 'running' as const } : job
    ));
    simulateTraining(jobId);
  };

  const cancelTraining = (jobId: string) => {
    setTrainingJobs(prev => prev.filter(job => job.id !== jobId));
    toast({
      title: 'Training Cancelled',
      description: 'The training job has been cancelled',
    });
  };

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'code': return <Code className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Model Training
          </h2>
          <p className="text-muted-foreground">Fine-tune and train custom AI models</p>
        </div>
        <Button onClick={() => setActiveTab('create')} className="gap-2">
          <Sparkles className="h-4 w-4" />
          New Training Job
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">Training Jobs</TabsTrigger>
          <TabsTrigger value="create">Create Job</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          {trainingJobs.map((job) => (
            <Card key={job.id} className="bg-gradient-to-br from-card to-card/50 border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${getStatusColor(job.status)}`} />
                    <div>
                      <CardTitle className="text-lg">{job.name}</CardTitle>
                      <CardDescription>{job.model}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.status === 'running' && (
                      <Button size="sm" variant="outline" onClick={() => pauseTraining(job.id)}>
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    {job.status === 'idle' && (
                      <Button size="sm" variant="outline" onClick={() => resumeTraining(job.id)}>
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => cancelTraining(job.id)}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round(job.progress)}%</span>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{job.epoch}/{job.totalEpochs}</p>
                      <p className="text-xs text-muted-foreground">Epochs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{job.loss.toFixed(3)}</p>
                      <p className="text-xs text-muted-foreground">Loss</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{(job.accuracy * 100).toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{job.estimatedTime}</p>
                      <p className="text-xs text-muted-foreground">ETA</p>
                    </div>
                  </div>

                  {job.status === 'running' && (
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium">GPU</p>
                          <p className="text-xs text-muted-foreground">{job.metrics.gpuUsage}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MemoryStick className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Memory</p>
                          <p className="text-xs text-muted-foreground">{job.metrics.memoryUsage}GB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <div>
                          <p className="text-sm font-medium">Temp</p>
                          <p className="text-xs text-muted-foreground">{job.metrics.temperature}°C</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Create Training Job</CardTitle>
              <CardDescription>Configure a new model training session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jobName">Job Name</Label>
                    <Input
                      id="jobName"
                      value={newJobConfig.name}
                      onChange={(e) => setNewJobConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Custom Model"
                    />
                  </div>

                  <div>
                    <Label htmlFor="modelType">Model Type</Label>
                    <Select value={newJobConfig.type} onValueChange={(value) => setNewJobConfig(prev => ({ ...prev, type: value as ModelConfig['type'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Generation</SelectItem>
                        <SelectItem value="code">Code Generation</SelectItem>
                        <SelectItem value="image">Image Generation</SelectItem>
                        <SelectItem value="audio">Audio Processing</SelectItem>
                        <SelectItem value="video">Video Generation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="baseModel">Base Model</Label>
                    <Select value={newJobConfig.baseModel} onValueChange={(value) => setNewJobConfig(prev => ({ ...prev, baseModel: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a base model" />
                      </SelectTrigger>
                      <SelectContent>
                        {modelOptions[newJobConfig.type as keyof typeof modelOptions]?.map(model => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="method">Fine-tuning Method</Label>
                    <Select value={newJobConfig.fineTuningMethod} onValueChange={(value) => setNewJobConfig(prev => ({ ...prev, fineTuningMethod: value as ModelConfig['fineTuningMethod'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lora">LoRA (Recommended)</SelectItem>
                        <SelectItem value="qlora">QLoRA (Memory Efficient)</SelectItem>
                        <SelectItem value="full">Full Fine-tuning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newJobConfig.description}
                      onChange={(e) => setNewJobConfig(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this model should learn..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="parameters">Training Parameters (M)</Label>
                    <Input
                      id="parameters"
                      type="number"
                      value={newJobConfig.parameters}
                      onChange={(e) => setNewJobConfig(prev => ({ ...prev, parameters: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="trainingData">Training Data URL</Label>
                    <Input
                      id="trainingData"
                      value={newJobConfig.trainingData}
                      onChange={(e) => setNewJobConfig(prev => ({ ...prev, trainingData: e.target.value }))}
                      placeholder="https://example.com/dataset.json"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex items-center gap-2">
                  <Switch id="advanced" />
                  <Label htmlFor="advanced">Advanced Options</Label>
                </div>
                <Button onClick={startTraining} disabled={isTraining} className="gap-2">
                  <Brain className="h-4 w-4" />
                  Start Training
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Training Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">94.2%</p>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Avg Training Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">2.4h</p>
                <p className="text-sm text-muted-foreground">Per model</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  GPU Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">78%</p>
                <p className="text-sm text-muted-foreground">Current usage</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Model Performance Comparison</CardTitle>
              <CardDescription>Compare trained models against benchmarks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Custom Code Assistant', accuracy: 89.2, speed: 145 },
                  { name: 'Creative Writing Model', accuracy: 94.5, speed: 98 },
                  { name: 'Base Model (Original)', accuracy: 82.1, speed: 120 },
                ].map((model, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-semibold">{model.name}</p>
                      <p className="text-sm text-muted-foreground">Accuracy: {model.accuracy}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{model.speed}</p>
                      <p className="text-sm text-muted-foreground">tokens/sec</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
