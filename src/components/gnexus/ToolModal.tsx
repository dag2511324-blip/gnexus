
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useGnexus } from "@/contexts/GnexusContext";
import { ToolType } from "@/types/gnexus";
import { ToolInterface } from "./ToolInterface";

interface ToolModalProps {
  tool: ToolType;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  inputs: Record<string, string>;
  onInputChange: (key: string, value: string) => void;
}

export function ToolModal({
  tool,
  title,
  description,
  icon,
  children,
  inputs,
  onInputChange,
}: ToolModalProps) {
  const { activeToolModal, closeToolModal, generateArtifact, isLoading, currentModel } = useGnexus();
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const isOpen = activeToolModal === tool;

  const handleGenerate = async () => {
    setError(null);
    const artifact = await generateArtifact(tool, inputs);
    if (artifact) {
      setResult(artifact);
    } else {
      setError('Failed to generate. AI models may be busy. Please try again.');
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    closeToolModal();
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden z-10"
        >
          {/* We remove the standalone header/close button as ToolInterface has its own structure, 
              but since ToolInterface is designed to be full content including header/footer, 
              we should just render ToolInterface directly inside the wrapper. 
              However, ToolInterface also has a close button which we can pass. 
              Checking ToolModal original structure, it had a close button in header.
              ToolInterface has header. Let's just use ToolInterface.
          */}

          <ToolInterface
            title={title}
            description={description}
            icon={icon}
            result={result}
            error={error}
            isLoading={isLoading}
            onGenerate={handleGenerate}
            onClose={handleClose}
            onReset={handleReset}
            footerInfo={`GNEXUS • ${currentModel.name}`}
          >
            {children}
          </ToolInterface>

          {/* Backup Close X in top right if ToolInterface styling looks off initially 
              or if we want a definitive close outside content area. 
              Actually ToolInterface header includes nothing on right. 
              Wait, ToolInterface header code:
              <div className="flex items-center justify-between ..."> ... </div>
              It only has left part. It does not have the X button. 
              Original ToolModal had an X button. 
              ToolInterface has onClose mapped to buttons in footer. 
              Let's add the absolute X button back to the Modal wrapper for expected UX.
           */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Input field component for tools - re-exporting or keeping for compatibility
// Input field component for tools - re-exporting or keeping for compatibility
interface ToolInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: 'text' | 'file' | 'select';
  accept?: string;
  options?: { label: string; value: string }[];
}

export function ToolInput({ label, value, onChange, placeholder, multiline, type = 'text', accept, options }: ToolInputProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // value will be the base64 string
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {type === 'file' ? (
        <div className="space-y-2">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
          />
          {value && (
            <div className="text-xs text-muted-foreground truncate bg-secondary/50 p-2 rounded-lg border border-border">
              File loaded ({Math.round(value.length / 1024)} KB)
            </div>
          )}
        </div>
      ) : type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl bg-secondary border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          rows={4}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      )}
    </div>
  );
}
