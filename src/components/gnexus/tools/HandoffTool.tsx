import { useState } from "react";
import { Code } from "lucide-react";
import { ToolModal, ToolInput } from "@/components/gnexus/ToolModal";

export function HandoffTool() {
  const [inputs, setInputs] = useState({
    componentOrScreen: "",
  });

  const handleChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="handoff"
      title="Dev Handoff"
      description="Export developer-ready specifications"
      icon={<Code className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="Component or Screen"
        value={inputs.componentOrScreen}
        onChange={(v) => handleChange("componentOrScreen", v)}
        placeholder="e.g., Task Card component, Dashboard screen..."
        multiline
      />
    </ToolModal>
  );
}
