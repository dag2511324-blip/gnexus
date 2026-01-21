import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { motion } from 'framer-motion';
import { 
  Crop, Maximize, SunMedium, RotateCw, FlipHorizontal, FlipVertical,
  Download, X, Check, Undo, Redo, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

interface FilterState {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sepia: number;
  grayscale: number;
}

const defaultFilters: FilterState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  sepia: 0,
  grayscale: 0,
};

const ASPECT_RATIOS = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
  { label: '9:16', value: 9 / 16 },
];

export function ImageEditor({ imageUrl, onSave, onCancel }: ImageEditorProps) {
  const [activeTab, setActiveTab] = useState('crop');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [resizeWidth, setResizeWidth] = useState(1024);
  const [resizeHeight, setResizeHeight] = useState(1024);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 1024, height: 1024 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load original image dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
      setResizeWidth(img.width);
      setResizeHeight(img.height);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getFilterString = () => {
    return `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      hue-rotate(${filters.hue}deg)
      blur(${filters.blur}px)
      sepia(${filters.sepia}%)
      grayscale(${filters.grayscale}%)
    `.trim();
  };

  const handleWidthChange = (newWidth: number) => {
    setResizeWidth(newWidth);
    if (maintainAspect) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setResizeHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setResizeHeight(newHeight);
    if (maintainAspect) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setResizeWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (): Promise<string> => {
    const image = await createImage(imageUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('No 2d context');

    const targetWidth = croppedAreaPixels ? croppedAreaPixels.width : resizeWidth;
    const targetHeight = croppedAreaPixels ? croppedAreaPixels.height : resizeHeight;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Apply transformations
    ctx.filter = getFilterString();
    
    ctx.translate(targetWidth / 2, targetHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.translate(-targetWidth / 2, -targetHeight / 2);

    if (croppedAreaPixels) {
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        targetWidth,
        targetHeight
      );
    } else {
      ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
    }

    return canvas.toDataURL('image/png');
  };

  const handleSave = async () => {
    try {
      const editedImage = await getCroppedImg();
      onSave(editedImage);
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  const resetFilters = () => setFilters(defaultFilters);
  const resetTransforms = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-card border-border">
        <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between py-3">
          <CardTitle className="text-lg">Image Editor</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-cyan-500">
              <Check className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Preview/Editor Area */}
            <div className="lg:col-span-2 bg-muted/30 rounded-lg overflow-hidden relative" style={{ height: '500px' }}>
              {activeTab === 'crop' ? (
                <Cropper
                  image={imageUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  rotation={rotation}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{
                    containerStyle: { height: '100%' },
                    mediaStyle: { 
                      filter: getFilterString(),
                      transform: `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`
                    }
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center overflow-hidden"
                  style={{ background: 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px' }}
                >
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                    style={{
                      filter: getFilterString(),
                      transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                      width: activeTab === 'resize' ? `${(resizeWidth / originalDimensions.width) * 100}%` : 'auto',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Controls Panel */}
            <div className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="crop" className="text-xs">
                    <Crop className="h-3 w-3 mr-1" />
                    Crop
                  </TabsTrigger>
                  <TabsTrigger value="resize" className="text-xs">
                    <Maximize className="h-3 w-3 mr-1" />
                    Resize
                  </TabsTrigger>
                  <TabsTrigger value="filters" className="text-xs">
                    <SunMedium className="h-3 w-3 mr-1" />
                    Filters
                  </TabsTrigger>
                  <TabsTrigger value="transform" className="text-xs">
                    <RotateCw className="h-3 w-3 mr-1" />
                    Transform
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="crop" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Aspect Ratio</Label>
                    <Select 
                      value={aspect?.toString() || 'free'} 
                      onValueChange={(v) => setAspect(v === 'free' ? undefined : parseFloat(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASPECT_RATIOS.map((ratio) => (
                          <SelectItem key={ratio.label} value={ratio.value?.toString() || 'free'}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Zoom: {zoom.toFixed(1)}x</Label>
                    <Slider
                      value={[zoom]}
                      min={1}
                      max={3}
                      step={0.1}
                      onValueChange={([v]) => setZoom(v)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="resize" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Width (px)</Label>
                    <Input
                      type="number"
                      value={resizeWidth}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                      min={1}
                      max={4096}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Height (px)</Label>
                    <Input
                      type="number"
                      value={resizeHeight}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                      min={1}
                      max={4096}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={maintainAspect}
                      onChange={(e) => setMaintainAspect(e.target.checked)}
                      className="rounded"
                    />
                    <Label className="text-sm">Maintain aspect ratio</Label>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Original: {originalDimensions.width} × {originalDimensions.height}
                  </div>
                </TabsContent>

                <TabsContent value="filters" className="space-y-4 mt-4">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      <RefreshCw className="h-3 w-3 mr-1" /> Reset
                    </Button>
                  </div>
                  {[
                    { key: 'brightness', label: 'Brightness', min: 0, max: 200, suffix: '%' },
                    { key: 'contrast', label: 'Contrast', min: 0, max: 200, suffix: '%' },
                    { key: 'saturation', label: 'Saturation', min: 0, max: 200, suffix: '%' },
                    { key: 'hue', label: 'Hue Rotation', min: 0, max: 360, suffix: '°' },
                    { key: 'blur', label: 'Blur', min: 0, max: 10, suffix: 'px' },
                    { key: 'sepia', label: 'Sepia', min: 0, max: 100, suffix: '%' },
                    { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, suffix: '%' },
                  ].map(({ key, label, min, max, suffix }) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs">{label}: {filters[key as keyof FilterState]}{suffix}</Label>
                      <Slider
                        value={[filters[key as keyof FilterState]]}
                        min={min}
                        max={max}
                        step={1}
                        onValueChange={([v]) => setFilters(prev => ({ ...prev, [key]: v }))}
                      />
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="transform" className="space-y-4 mt-4">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={resetTransforms}>
                      <RefreshCw className="h-3 w-3 mr-1" /> Reset
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Rotation: {rotation}°</Label>
                    <Slider
                      value={[rotation]}
                      min={0}
                      max={360}
                      step={1}
                      onValueChange={([v]) => setRotation(v)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={flipH ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFlipH(!flipH)}
                      className="flex-1"
                    >
                      <FlipHorizontal className="h-4 w-4 mr-1" /> Flip H
                    </Button>
                    <Button
                      variant={flipV ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFlipV(!flipV)}
                      className="flex-1"
                    >
                      <FlipVertical className="h-4 w-4 mr-1" /> Flip V
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 90, 180, 270].map((deg) => (
                      <Button
                        key={deg}
                        variant={rotation === deg ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRotation(deg)}
                      >
                        {deg}°
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Export Options */}
              <div className="pt-4 border-t border-border/50 space-y-2">
                <Label>Export Format</Label>
                <div className="flex gap-2">
                  {['PNG', 'JPEG', 'WebP'].map((format) => (
                    <Button key={format} variant="outline" size="sm" className="flex-1">
                      {format}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={previewCanvasRef} className="hidden" />
    </motion.div>
  );
}
