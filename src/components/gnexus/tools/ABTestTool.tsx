import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { ToolModal, ToolInput } from '../ToolModal';

export function ABTestTool() {
  const [inputs, setInputs] = useState({
    hypothesis: '',
    feature: '',
  });

  const handleChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="ab-test"
      title="A/B Test Planner"
      description="Plan experiment variants and success metrics"
      icon={<FlaskConical className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="Hypothesis"
        value={inputs.hypothesis}
        onChange={(v) => handleChange('hypothesis', v)}
        placeholder="If we change X, then Y will improve..."
        multiline
      />
      <ToolInput
        label="Feature to Test"
        value={inputs.feature}
        onChange={(v) => handleChange('feature', v)}
        placeholder="Button color, CTA text, layout..."
      />
    </ToolModal>
  );
}
