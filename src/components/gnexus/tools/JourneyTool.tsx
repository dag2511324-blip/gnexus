import { useState } from "react";
import { Map } from "lucide-react";
import { ToolModal, ToolInput } from "@/components/gnexus/ToolModal";

export function JourneyTool() {
  const [inputs, setInputs] = useState({
    goal: "",
  });

  const handleChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="journey"
      title="Journey Builder"
      description="Design comprehensive user journeys"
      icon={<Map className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="User Goal"
        value={inputs.goal}
        onChange={(v) => handleChange("goal", v)}
        placeholder="e.g., Complete first task assignment, Onboard new team member..."
        multiline
      />
    </ToolModal>
  );
}
