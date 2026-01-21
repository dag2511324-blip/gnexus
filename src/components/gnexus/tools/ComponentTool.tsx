import { useState } from "react";
import { PenTool } from "lucide-react";
import { ToolModal, ToolInput } from "@/components/gnexus/ToolModal";

export function ComponentTool() {
  const [inputs, setInputs] = useState({
    componentName: "",
    purpose: "",
  });

  const handleChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="component"
      title="Component Specs"
      description="Define UI component specifications"
      icon={<PenTool className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="Component Name"
        value={inputs.componentName}
        onChange={(v) => handleChange("componentName", v)}
        placeholder="e.g., Button, Card, Modal, Dropdown..."
      />
      <ToolInput
        label="Purpose"
        value={inputs.purpose}
        onChange={(v) => handleChange("purpose", v)}
        placeholder="e.g., Primary action trigger with loading state..."
        multiline
      />
    </ToolModal>
  );
}
