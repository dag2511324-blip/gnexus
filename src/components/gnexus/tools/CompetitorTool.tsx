import { useState } from "react";
import { BarChart } from "lucide-react";
import { ToolModal, ToolInput } from "@/components/gnexus/ToolModal";

export function CompetitorTool() {
  const [inputs, setInputs] = useState({
    competitors: "",
  });

  const handleChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="competitor-analysis"
      title="Competitor Analysis"
      description="Feature comparison"
      icon={<BarChart className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="Competitors"
        value={inputs.competitors}
        onChange={(v) => handleChange("competitors", v)}
        placeholder="e.g., Asana, Monday, Linear, Notion..."
        multiline
      />
    </ToolModal>
  );
}
