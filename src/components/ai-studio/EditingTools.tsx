import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crop, Palette, Type, Wand2, Sliders, 
  Image, Video, Music, FileText, Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageEditor } from './ImageEditor';

interface EditingToolsProps {
  initialImage?: string;
}

const EDITING_TOOLS = [
  { id: 'image', label: 'Image Editor', icon: Image, description: 'Crop, resize, filters, transform' },
  { id: 'enhance', label: 'AI Enhance', icon: Wand2, description: 'Auto-enhance with AI' },
  { id: 'color', label: 'Color Adjust', icon: Palette, description: 'Color correction and grading' },
  { id: 'text', label: 'Add Text', icon: Type, description: 'Add text overlays' },
];

export function EditingTools({ initialImage }: EditingToolsProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [imageToEdit, setImageToEdit] = useState<string | null>(initialImage || null);
  const [showEditor, setShowEditor] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageToEdit(event.target?.result as string);
        setActiveTab('edit');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlInput = (url: string) => {
    if (url) {
      setImageToEdit(url);
      setActiveTab('edit');
    }
  };

  const handleSaveEdit = (editedImageUrl: string) => {
    setEditedImage(editedImageUrl);
    setShowEditor(false);
  };

  return (
    <div className="space-y-6">
      {showEditor && imageToEdit && (
        <ImageEditor
          imageUrl={imageToEdit}
          onSave={handleSaveEdit}
          onCancel={() => setShowEditor(false)}
        />
      )}

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            Editing Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="upload" className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="edit" className="flex-1" disabled={!imageToEdit}>
                <Crop className="h-4 w-4 mr-2" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="result" className="flex-1" disabled={!editedImage}>
                <Image className="h-4 w-4 mr-2" />
                Result
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-muted/50">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Upload an image to edit</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Drag and drop or click to browse
                    </p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button variant="outline" asChild>
                        <span>Browse Files</span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <Label>Or paste an image URL</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/image.png"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUrlInput((e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder*="https"]') as HTMLInputElement;
                      if (input?.value) handleUrlInput(input.value);
                    }}
                  >
                    Load
                  </Button>
                </div>
              </div>

              {/* Tool Cards */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {EDITING_TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Card 
                      key={tool.id}
                      className="bg-muted/30 border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <CardContent className="p-4 text-center">
                        <div className="flex justify-center mb-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                        <h4 className="font-medium text-sm">{tool.label}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="edit" className="space-y-6">
              {imageToEdit && (
                <div className="space-y-4">
                  {/* Preview */}
                  <div className="relative rounded-lg overflow-hidden bg-muted/30">
                    <img
                      src={imageToEdit}
                      alt="To edit"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>

                  {/* Editing Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => setShowEditor(true)}
                    >
                      <Crop className="h-5 w-5" />
                      <span className="text-xs">Crop & Resize</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => setShowEditor(true)}
                    >
                      <Palette className="h-5 w-5" />
                      <span className="text-xs">Filters</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => setShowEditor(true)}
                    >
                      <Sliders className="h-5 w-5" />
                      <span className="text-xs">Adjustments</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => setShowEditor(true)}
                    >
                      <Wand2 className="h-5 w-5" />
                      <span className="text-xs">AI Enhance</span>
                    </Button>
                  </div>

                  <Button 
                    onClick={() => setShowEditor(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    Open Full Editor
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="result" className="space-y-6">
              {editedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="rounded-lg overflow-hidden bg-muted/30">
                    <img
                      src={editedImage}
                      alt="Edited"
                      className="w-full h-auto"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setImageToEdit(editedImage);
                        setActiveTab('edit');
                      }}
                    >
                      Edit More
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = editedImage;
                        link.download = `edited-${Date.now()}.png`;
                        link.click();
                      }}
                    >
                      Download
                    </Button>
                  </div>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
