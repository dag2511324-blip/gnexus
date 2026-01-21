import { useState } from 'react';
import { Accessibility } from 'lucide-react';
import { ToolModal, ToolInput } from '../ToolModal';

export function AccessibilityTool() {
  const [inputs, setInputs] = useState({
    component: '',
    level: '',
  });

  const handleChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="accessibility"
      title="Accessibility Checker"
      description="Generate WCAG compliance checklist"
      icon={<Accessibility className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="Component/Screen"
        value={inputs.component}
        onChange={(v) => handleChange('component', v)}
        placeholder="Login form, Navigation menu..."
      />
      <ToolInput
        label="WCAG Level"
        value={inputs.level}
        onChange={(v) => handleChange('level', v)}
        placeholder="A, AA, or AAA"
      />
    </ToolModal>
  );
}
