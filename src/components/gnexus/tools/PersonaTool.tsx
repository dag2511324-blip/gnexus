import { useState } from "react";
import { Users } from "lucide-react";
import { ToolModal, ToolInput } from "@/components/gnexus/ToolModal";

export function PersonaTool() {
  const [inputs, setInputs] = useState({
    description: "",
  });

  const handleChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="persona"
      title="Persona Generator"
      description="Create detailed user profiles"
      icon={<Users className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="User Description"
        value={inputs.description}
        onChange={(v) => handleChange("description", v)}
        placeholder="e.g., Team lead managing remote developers, needs visibility into project progress..."
        multiline
      />
    </ToolModal>
  );
}
