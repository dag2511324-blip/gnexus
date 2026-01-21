import { useState } from 'react';
import { Palette } from 'lucide-react';
import { ToolModal, ToolInput } from '../ToolModal';

export function ColorPaletteTool() {
  const [inputs, setInputs] = useState({
    mood: '',
    industry: '',
  });

  const handleChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="color-palette"
      title="Color Palette Generator"
      description="Generate brand color palette"
      icon={<Palette className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="Brand Mood"
        value={inputs.mood}
        onChange={(v) => handleChange('mood', v)}
        placeholder="Professional, playful, minimal..."
      />
      <ToolInput
        label="Industry"
        value={inputs.industry}
        onChange={(v) => handleChange('industry', v)}
        placeholder="Tech, healthcare, finance..."
      />
    </ToolModal>
  );
}
