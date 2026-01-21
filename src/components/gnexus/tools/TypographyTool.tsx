import { useState } from 'react';
import { Type } from 'lucide-react';
import { ToolModal, ToolInput } from '../ToolModal';

export function TypographyTool() {
  const [inputs, setInputs] = useState({
    tone: '',
    platform: '',
  });

  const handleChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="typography"
      title="Typography System"
      description="Generate font pairings and scale"
      icon={<Type className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="Brand Tone"
        value={inputs.tone}
        onChange={(v) => handleChange('tone', v)}
        placeholder="Modern, classic, friendly..."
      />
      <ToolInput
        label="Primary Platform"
        value={inputs.platform}
        onChange={(v) => handleChange('platform', v)}
        placeholder="Web, mobile, print..."
      />
    </ToolModal>
  );
}
