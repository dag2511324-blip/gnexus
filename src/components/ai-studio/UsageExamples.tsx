import React from 'react';
import { motion } from 'framer-motion';
import { Video, Image, Music, FileText, Code, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const EXAMPLES = [
  {
    modality: 'image',
    icon: Image,
    color: 'from-blue-500 to-cyan-500',
    title: 'Image Generation',
    examples: [
      { prompt: 'A futuristic city skyline at sunset with flying cars', tags: ['sci-fi', 'architecture'] },
      { prompt: 'Professional product photo of a sleek smartphone on marble', tags: ['product', 'minimal'] },
      { prompt: 'Abstract geometric logo with blue and purple gradients', tags: ['logo', 'design'] },
      { prompt: 'Cozy coffee shop interior with warm lighting and plants', tags: ['interior', 'lifestyle'] },
    ],
  },
  {
    modality: 'video',
    icon: Video,
    color: 'from-purple-500 to-pink-500',
    title: 'Video Generation',
    examples: [
      { prompt: 'Ocean waves crashing on a rocky shore at golden hour', tags: ['nature', 'cinematic'] },
      { prompt: 'Smooth camera pan through a modern office space', tags: ['business', 'interior'] },
      { prompt: 'Particles forming into a glowing logo animation', tags: ['motion', 'brand'] },
      { prompt: 'Time-lapse of clouds moving over mountain peaks', tags: ['timelapse', 'nature'] },
    ],
  },
  {
    modality: 'audio',
    icon: Music,
    color: 'from-green-500 to-emerald-500',
    title: 'Audio Generation',
    examples: [
      { prompt: 'Welcome to our platform. We are excited to have you here.', tags: ['voiceover', 'professional'] },
      { prompt: 'Your order has been confirmed and will arrive soon.', tags: ['notification', 'friendly'] },
      { prompt: 'Breaking news: scientists discover new renewable energy source.', tags: ['news', 'formal'] },
      { prompt: 'Hey there! Thanks for checking out our latest video.', tags: ['casual', 'youtube'] },
    ],
  },
  {
    modality: 'text',
    icon: FileText,
    color: 'from-orange-500 to-red-500',
    title: 'Text Generation',
    examples: [
      { prompt: 'Write a compelling product description for wireless earbuds', tags: ['marketing', 'product'] },
      { prompt: 'Create a professional email requesting a meeting', tags: ['email', 'business'] },
      { prompt: 'Generate 5 creative taglines for an eco-friendly brand', tags: ['branding', 'creative'] },
      { prompt: 'Write an engaging blog post intro about AI trends', tags: ['blog', 'tech'] },
    ],
  },
  {
    modality: 'code',
    icon: Code,
    color: 'from-violet-500 to-indigo-500',
    title: 'Code Generation',
    examples: [
      { prompt: 'Create a React hook for debounced search input', tags: ['react', 'hooks'] },
      { prompt: 'Write a TypeScript function to validate email addresses', tags: ['typescript', 'validation'] },
      { prompt: 'Generate a responsive CSS grid layout for a gallery', tags: ['css', 'layout'] },
      { prompt: 'Create an API endpoint for user authentication', tags: ['api', 'auth'] },
    ],
  },
];

export function UsageExamples() {
  const handleUseExample = (prompt: string) => {
    // Could emit event or update context to use this prompt
    navigator.clipboard.writeText(prompt);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Usage Examples</h2>
        <p className="text-muted-foreground">Get inspired with these prompt templates</p>
      </div>
      
      <div className="space-y-8">
        {EXAMPLES.map((category, idx) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.modality}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle>{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.examples.map((example, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group cursor-pointer"
                        onClick={() => handleUseExample(example.prompt)}
                      >
                        <p className="text-sm mb-3">{example.prompt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {example.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            Use <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
