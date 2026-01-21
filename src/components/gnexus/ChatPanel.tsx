import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  Download,
  RotateCcw,
  MoreHorizontal,
  Bot,
  User,
  Copy,
  Star,
  Users,
  Target,
  Lightbulb,
  BarChart3,
  Send,
  Paperclip,
  Image,
  Loader2,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGnexus } from "@/contexts/GnexusContext";
import { ModelSelector } from "@/components/gnexus/ModelSelector";
import { useToast } from "@/hooks/use-toast";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  variant?: "primary" | "accent" | "secondary";
  onClick?: () => void;
}

const ActionButton = ({ icon, label, variant = "secondary", onClick }: ActionButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
      variant === "primary" &&
      "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20",
      variant === "accent" &&
      "bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20",
      variant === "secondary" &&
      "bg-secondary text-foreground border border-border hover:bg-muted"
    )}
  >
    {icon}
    {label}
  </button>
);

export function ChatPanel() {
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; base64: string; type: 'image' | 'file' }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, isLoading, sendMessage, openToolModal, session, currentModel } = useGnexus();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if ((!inputMessage.trim() && selectedFiles.length === 0) || isLoading) return;

    // Prepare attachments
    const attachments = selectedFiles.map(f => ({
      type: f.type,
      content: f.base64,
      name: f.file.name
    }));

    const msg = inputMessage;
    setInputMessage("");
    setSelectedFiles([]);
    await sendMessage(msg, attachments);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const isImage = file.type.startsWith('image/');

      // Check capability
      if (isImage && !currentModel.capabilities?.includes('vision')) {
        toast({
          title: "Model Capability Required",
          description: `The current model (${currentModel.name}) does not support vision. Please switch to a vision-capable model (e.g. Molmo, Nemotron VL).`,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedFiles(prev => [...prev, {
            file,
            base64: event.target!.result as string,
            type: isImage ? 'image' : 'file'
          }]);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="font-semibold text-foreground">Design Session</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
            <Cpu className="h-3 w-3 text-primary" />
            <span className="text-xs text-muted-foreground">{currentModel.name}</span>
            {currentModel.capabilities?.map(cap => (
              <span key={cap} className="px-1.5 py-0.5 rounded-sm bg-background/50 text-[10px] uppercase font-bold text-primary/70 border border-primary/20">
                {cap}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <Bookmark className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <Download className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">G-CORE01 Ready</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Describe your product idea, and I'll help you create personas, user journeys, flows, and implementation-ready specifications.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setInputMessage("I'm building a task management app for remote teams")}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                Task management app
              </button>
              <button
                onClick={() => setInputMessage("I need to design an e-commerce checkout flow")}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                E-commerce checkout
              </button>
              <button
                onClick={() => setInputMessage("Help me create user personas for a fitness app")}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                Fitness app personas
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border",
                message.role === 'assistant' ? "bg-card" : "bg-primary/10"
              )}>
                {message.role === 'assistant' ? (
                  <Bot className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <User className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className={cn(
                  "rounded-xl p-4 border",
                  message.role === 'assistant'
                    ? "rounded-tl-none bg-card border-border"
                    : "rounded-tr-none bg-primary/5 border-primary/20"
                )}>
                  {/* Attachments Display */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {message.attachments.map((att, i) => (
                        att.type === 'image' ? (
                          <img key={i} src={att.content} alt="attachment" className="h-48 w-auto rounded-md border border-border object-contain bg-black/20" />
                        ) : (
                          <div key={i} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md text-xs">
                            <Paperclip className="h-3 w-3" />
                            {att.name || 'File'}
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-mono">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.modelUsed && (
                      <span className="text-primary/70">{message.modelUsed}</span>
                    )}
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                      <Star className="h-3 w-3" />
                      Save
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card border border-border">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>G-CORE01 is thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />

        {/* Suggested Actions */}
        {messages.length > 0 && !isLoading && (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Actions
            </p>
            <div className="flex flex-wrap gap-2">
              <ActionButton
                icon={<Target className="h-4 w-4" />}
                label="Map JTBD"
                variant="accent"
                onClick={() => openToolModal('jtbd')}
              />
              <ActionButton
                icon={<Users className="h-4 w-4" />}
                label="Create Persona"
                variant="secondary"
                onClick={() => openToolModal('persona')}
              />
              <ActionButton
                icon={<Lightbulb className="h-4 w-4" />}
                label="User Journey"
                variant="secondary"
                onClick={() => openToolModal('journey')}
              />
              <ActionButton
                icon={<BarChart3 className="h-4 w-4" />}
                label="Competitors"
                variant="secondary"
                onClick={() => openToolModal('competitor-analysis')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        {/* File Previews */}
        {selectedFiles.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
            {selectedFiles.map((file, i) => (
              <div key={i} className="relative group shrink-0">
                {file.type === 'image' ? (
                  <img src={file.base64} alt="preview" className="h-16 w-16 object-cover rounded-md border border-border" />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center bg-secondary rounded-md border border-border">
                    <Paperclip className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <button
                  onClick={() => removeFile(i)}
                  className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.txt,.md"
          />
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              currentModel.capabilities?.includes('vision')
                ? "Describe your product, paste images, or type / for commands..."
                : "Describe your product, ask questions, or type / for commands..."
            }
            className="w-full resize-none rounded-xl bg-card border border-border px-4 py-3 pr-28 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={1}
            disabled={isLoading}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors",
                !currentModel.capabilities?.includes('vision') && "opacity-50 cursor-not-allowed hover:bg-transparent"
              )}
              title={!currentModel.capabilities?.includes('vision') ? "Switch to a vision model to upload images" : "Attach image"}
              disabled={!currentModel.capabilities?.includes('vision')}
            >
              <Image className="h-4 w-4" />
            </button>
            <Button
              size="sm"
              className="h-8 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleSend}
              disabled={isLoading || (!inputMessage.trim() && selectedFiles.length === 0)}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ModelSelector />
            <span className="text-border">•</span>
            <span>Enter to send • Shift+Enter for newline</span>
          </div>
          <span className="font-mono">GNEXUS v2.0</span>
        </div>
      </div>
    </div>
  );
}
