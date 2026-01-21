import { useState } from "react";
import { Layout } from "lucide-react";
import { ToolModal, ToolInput } from "@/components/gnexus/ToolModal";

export function WireframeTool() {
  const [inputs, setInputs] = useState({
    screenName: "",
    purpose: "",
  });

  const handleChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="wireframe"
      title="Wireframe Tool"
      description="Sketch layout structures"
      icon={<Layout className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="Screen Name"
        value={inputs.screenName}
        onChange={(v) => handleChange("screenName", v)}
        placeholder="e.g., Dashboard, Settings, Profile..."
      />
      <ToolInput
        label="Purpose"
        value={inputs.purpose}
        onChange={(v) => handleChange("purpose", v)}
        placeholder="e.g., Display task overview and quick actions..."
        multiline
      />
    </ToolModal>
  );
}
