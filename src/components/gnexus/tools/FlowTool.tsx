import { useState } from "react";
import { GitBranch } from "lucide-react";
import { ToolModal, ToolInput } from "@/components/gnexus/ToolModal";

export function FlowTool() {
  const [inputs, setInputs] = useState({
    feature: "",
  });

  const handleChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="flow"
      title="Flow Designer"
      description="Create user flow diagrams"
      icon={<GitBranch className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="Feature or Task"
        value={inputs.feature}
        onChange={(v) => handleChange("feature", v)}
        placeholder="e.g., User registration, Task creation, File upload..."
        multiline
      />
    </ToolModal>
  );
}
