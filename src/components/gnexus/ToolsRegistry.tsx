
import { useState } from "react";
import { ToolModal, ToolInput } from "@/components/gnexus/ToolModal";
import { ALL_TOOLS, ToolDefinition } from "@/lib/tools-data";

function GenericTool({ toolDef }: { toolDef: ToolDefinition }) {
    const [inputs, setInputs] = useState<Record<string, string>>({});

    const handleChange = (key: string, value: string) => {
        setInputs((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <ToolModal
            tool={toolDef.id}
            title={toolDef.name}
            description={toolDef.description}
            icon={<toolDef.icon className="h-5 w-5" />}
            inputs={inputs}
            onInputChange={handleChange}
        >
            {toolDef.inputFields.map((field) => (
                <ToolInput
                    key={field.key}
                    label={field.label}
                    value={inputs[field.key] || ''}
                    onChange={(v) => handleChange(field.key, v)}
                    placeholder={field.placeholder}
                    multiline={field.multiline}
                    type={field.type}
                    accept={field.accept}
                    options={field.options}
                />
            ))}
        </ToolModal>
    );
}

export function ToolsRegistry() {
    return (
        <>
            {ALL_TOOLS.map((tool) => (
                <GenericTool key={tool.id} toolDef={tool} />
            ))}
        </>
    );
}
