import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { ToolModal, ToolInput } from "@/components/gnexus/ToolModal";

export function MicrocopyTool() {
  const [inputs, setInputs] = useState({
    context: "",
    element: "",
  });

  const handleChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="microcopy"
      title="Microcopy Writer"
      description="Generate UX content"
      icon={<MessageSquare className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="Context"
        value={inputs.context}
        onChange={(v) => handleChange("context", v)}
        placeholder="e.g., User trying to delete their account, Empty state for tasks..."
      />
      <ToolInput
        label="UI Element"
        value={inputs.element}
        onChange={(v) => handleChange("element", v)}
        placeholder="e.g., Button text, Error message, Placeholder, Tooltip..."
      />
    </ToolModal>
  );
}
