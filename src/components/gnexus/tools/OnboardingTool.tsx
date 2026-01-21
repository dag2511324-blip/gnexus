import { useState } from 'react';
import { Rocket } from 'lucide-react';
import { ToolModal, ToolInput } from '../ToolModal';

export function OnboardingTool() {
  const [inputs, setInputs] = useState({
    productType: '',
    targetUser: '',
  });

  const handleChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="onboarding"
      title="Onboarding Flow"
      description="Design user onboarding sequence"
      icon={<Rocket className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="Product Type"
        value={inputs.productType}
        onChange={(v) => handleChange('productType', v)}
        placeholder="SaaS, mobile app, e-commerce..."
      />
      <ToolInput
        label="Target User"
        value={inputs.targetUser}
        onChange={(v) => handleChange('targetUser', v)}
        placeholder="New users, power users..."
      />
    </ToolModal>
  );
}
