import { useState } from "react";
import { Search } from "lucide-react";
import { ToolModal, ToolInput } from "@/components/gnexus/ToolModal";

export function MarketResearchTool() {
  const [inputs, setInputs] = useState({
    category: "",
    industry: "",
  });

  const handleChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="market-research"
      title="Market Research"
      description="Industry data & trends"
      icon={<Search className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="Product Category"
        value={inputs.category}
        onChange={(v) => handleChange("category", v)}
        placeholder="e.g., Project Management Software, Team Collaboration Tools..."
      />
      <ToolInput
        label="Industry"
        value={inputs.industry}
        onChange={(v) => handleChange("industry", v)}
        placeholder="e.g., SaaS, Enterprise Software, B2B..."
      />
    </ToolModal>
  );
}
