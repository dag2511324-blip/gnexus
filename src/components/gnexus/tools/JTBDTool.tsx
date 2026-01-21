import { useState } from "react";
import { Target } from "lucide-react";
import { ToolModal, ToolInput } from "@/components/gnexus/ToolModal";

export function JTBDTool() {
  const [inputs, setInputs] = useState({
    userType: "",
  });

  const handleChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ToolModal
      tool="jtbd"
      title="JTBD Mapper"
      description="Map jobs-to-be-done frameworks"
      icon={<Target className="h-5 w-5" />}
      inputs={inputs}
      onInputChange={handleChange}
    >
      <ToolInput
        label="User Type"
        value={inputs.userType}
        onChange={(v) => handleChange("userType", v)}
        placeholder="e.g., Project Manager, Developer, Designer..."
      />
    </ToolModal>
  );
}
