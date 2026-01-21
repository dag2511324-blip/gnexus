import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ToolModal, ToolInput } from '../ToolModal';

export function ErrorMessageTool() {
  const [inputs, setInputs] = useState({
    errorType: '',
    context: '',
  });

  const handleChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="error-message"
      title="Error Message Writer"
      description="Generate user-friendly error messages"
      icon={<AlertTriangle className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="Error Type"
        value={inputs.errorType}
        onChange={(v) => handleChange('errorType', v)}
        placeholder="Validation, server, network..."
      />
      <ToolInput
        label="Context"
        value={inputs.context}
        onChange={(v) => handleChange('context', v)}
        placeholder="Form submission, file upload..."
      />
    </ToolModal>
  );
}
