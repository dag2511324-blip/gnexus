import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { ToolModal, ToolInput } from "@/components/gnexus/ToolModal";

export function TrendTool() {
  const [inputs, setInputs] = useState({
    industry: "",
  });

  const handleChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="trend-analysis"
      title="Trend Analysis"
      description="Emerging patterns"
      icon={<TrendingUp className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="Industry or Technology Area"
        value={inputs.industry}
        onChange={(v) => handleChange("industry", v)}
        placeholder="e.g., AI in UX Design, Remote Work Tools, No-Code Platforms..."
        multiline
      />
    </ToolModal>
  );
}
