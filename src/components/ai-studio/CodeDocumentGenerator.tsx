import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, FileCode, Download, Loader2, Sparkles, 
  Copy, Check, BookOpen, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateDocument, downloadDocument, OutputFormat, DocumentSection } from '@/lib/document-utils';

const CODE_DOC_TYPES = [
  { id: 'api', label: 'API Documentation', description: 'REST/GraphQL API reference' },
  { id: 'readme', label: 'README', description: 'Project overview and setup' },
  { id: 'technical', label: 'Technical Spec', description: 'Architecture and design docs' },
  { id: 'tutorial', label: 'Tutorial', description: 'Step-by-step coding guide' },
  { id: 'changelog', label: 'Changelog', description: 'Version history and updates' },
  { id: 'contributing', label: 'Contributing Guide', description: 'Contribution guidelines' },
];

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift'
];

export function CodeDocumentGenerator() {
  const [docType, setDocType] = useState('api');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('md');
  const [title, setTitle] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [language, setLanguage] = useState('TypeScript');
  const [projectName, setProjectName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [copied, setCopied] = useState(false);
  
  // Options
  const [includeExamples, setIncludeExamples] = useState(true);
  const [includeTypes, setIncludeTypes] = useState(true);
  const [includeErrors, setIncludeErrors] = useState(true);
  
  const { toast } = useToast();

  const generateDocumentation = async () => {
    if (!codeInput.trim() && !projectName.trim()) {
      toast({ title: 'Please enter code or project description', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);

    try {
      const systemPrompt = getSystemPromptForDocType();
      
      const userPrompt = codeInput 
        ? `Generate ${docType} documentation for the following ${language} code:\n\n\`\`\`${language.toLowerCase()}\n${codeInput}\n\`\`\`\n\nProject name: ${projectName || 'My Project'}`
        : `Generate ${docType} documentation for a project called "${projectName}" using ${language}.`;

      const { data, error } = await supabase.functions.invoke('openrouter-chat', {
        body: {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          model: 'qwen/qwen-2.5-7b-instruct:free',
        }
      });

      if (error) throw error;

      const content = data?.content || data?.text || '';
      setGeneratedContent(content);
      
      const parsedSections = parseCodeDocsToSections(content);
      setSections(parsedSections);
      
      if (!title) {
        setTitle(`${projectName || 'Project'} - ${CODE_DOC_TYPES.find(t => t.id === docType)?.label || 'Documentation'}`);
      }

      toast({ title: 'Documentation generated successfully!' });
    } catch (error) {
      console.error('Generation error:', error);
      toast({ title: 'Failed to generate documentation', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const getSystemPromptForDocType = (): string => {
    const basePrompt = `You are a technical documentation expert. Generate professional, clear documentation in Markdown format.`;
    
    const typePrompts: Record<string, string> = {
      'api': `${basePrompt} Create comprehensive API documentation with:
        - Endpoint descriptions
        - Request/response examples
        - Authentication details
        - Error codes and handling
        ${includeTypes ? '- TypeScript/type definitions' : ''}
        ${includeExamples ? '- Code examples in multiple languages' : ''}`,
      'readme': `${basePrompt} Create a professional README with:
        - Project description and features
        - Installation instructions
        - Quick start guide
        - Configuration options
        - License information`,
      'technical': `${basePrompt} Create technical specification with:
        - Architecture overview
        - Component descriptions
        - Data flow diagrams (in text)
        - Dependencies and requirements
        - Performance considerations`,
      'tutorial': `${basePrompt} Create a step-by-step tutorial with:
        - Prerequisites
        - Clear, numbered steps
        - Code examples at each step
        - Expected outputs
        - Common issues and solutions`,
      'changelog': `${basePrompt} Create a changelog following Keep a Changelog format:
        - Grouped by version
        - Categories: Added, Changed, Deprecated, Removed, Fixed, Security
        - Clear, concise descriptions`,
      'contributing': `${basePrompt} Create contribution guidelines with:
        - Code of conduct summary
        - How to report issues
        - Pull request process
        - Code style guidelines
        - Testing requirements`,
    };
    
    return typePrompts[docType] || basePrompt;
  };

  const parseCodeDocsToSections = (content: string): DocumentSection[] => {
    const sections: DocumentSection[] = [];
    const lines = content.split('\n');
    let currentParagraph = '';
    let inCodeBlock = false;
    let codeBlockContent = '';
    let codeBlockLang = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          sections.push({ title: codeBlockLang || 'Code', content: codeBlockContent.trim(), type: 'code' });
          codeBlockContent = '';
          inCodeBlock = false;
        } else {
          // Start code block
          if (currentParagraph) {
            sections.push({ title: '', content: currentParagraph.trim(), type: 'paragraph' });
            currentParagraph = '';
          }
          inCodeBlock = true;
          codeBlockLang = trimmedLine.slice(3);
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent += line + '\n';
        continue;
      }

      if (trimmedLine.startsWith('# ')) {
        if (currentParagraph) {
          sections.push({ title: '', content: currentParagraph.trim(), type: 'paragraph' });
          currentParagraph = '';
        }
        sections.push({ title: trimmedLine.slice(2), content: '', type: 'heading', level: 1 });
      } else if (trimmedLine.startsWith('## ')) {
        if (currentParagraph) {
          sections.push({ title: '', content: currentParagraph.trim(), type: 'paragraph' });
          currentParagraph = '';
        }
        sections.push({ title: trimmedLine.slice(3), content: '', type: 'heading', level: 2 });
      } else if (trimmedLine.startsWith('### ')) {
        if (currentParagraph) {
          sections.push({ title: '', content: currentParagraph.trim(), type: 'paragraph' });
          currentParagraph = '';
        }
        sections.push({ title: trimmedLine.slice(4), content: '', type: 'heading', level: 3 });
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || /^\d+\.\s/.test(trimmedLine)) {
        if (currentParagraph) {
          sections.push({ title: '', content: currentParagraph.trim(), type: 'paragraph' });
          currentParagraph = '';
        }
        const listItems: string[] = [trimmedLine.replace(/^[-*]\s|^\d+\.\s/, '')];
        sections.push({ title: '', content: listItems.join('\n'), type: 'list' });
      } else if (trimmedLine) {
        currentParagraph += line + '\n';
      } else if (currentParagraph) {
        sections.push({ title: '', content: currentParagraph.trim(), type: 'paragraph' });
        currentParagraph = '';
      }
    }

    if (currentParagraph) {
      sections.push({ title: '', content: currentParagraph.trim(), type: 'paragraph' });
    }

    return sections.filter(s => s.content || s.title);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleDownload = async () => {
    if (!generatedContent) {
      toast({ title: 'Please generate documentation first', variant: 'destructive' });
      return;
    }

    try {
      const blob = await generateDocument({
        title: title || 'Code Documentation',
        content: generatedContent,
        type: 'code-docs',
        format: outputFormat,
        sections: sections.length > 0 ? sections : undefined,
        includeTableOfContents: true,
        includePageNumbers: outputFormat === 'pdf',
      });

      const extensions: Record<OutputFormat, string> = {
        pdf: '.pdf', docx: '.docx', pptx: '.pptx', txt: '.txt', md: '.md'
      };
      
      const filename = `${projectName || 'documentation'}-${Date.now()}${extensions[outputFormat]}`;
      downloadDocument(blob, filename);
      
      toast({ title: 'Documentation downloaded!' });
    } catch (error) {
      console.error('Download error:', error);
      toast({ title: 'Failed to download', variant: 'destructive' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Code Documentation Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Documentation Type */}
          <div className="space-y-2">
            <Label>Documentation Type</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CODE_DOC_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div>
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <Label>Output Format</Label>
            <div className="flex gap-2">
              {(['md', 'pdf', 'docx', 'txt'] as OutputFormat[]).map((format) => (
                <Button
                  key={format}
                  variant={outputFormat === format ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOutputFormat(format)}
                >
                  {format.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="my-awesome-project"
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label>Programming Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Code Input */}
          <div className="space-y-2">
            <Label>Code to Document (optional)</Label>
            <Textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder={`Paste your ${language} code here...`}
              rows={8}
              className="font-mono text-sm resize-none"
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>Include in Documentation</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="examples"
                  checked={includeExamples}
                  onCheckedChange={(checked) => setIncludeExamples(checked as boolean)}
                />
                <label htmlFor="examples" className="text-sm">Code Examples</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="types"
                  checked={includeTypes}
                  onCheckedChange={(checked) => setIncludeTypes(checked as boolean)}
                />
                <label htmlFor="types" className="text-sm">Type Definitions</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="errors"
                  checked={includeErrors}
                  onCheckedChange={(checked) => setIncludeErrors(checked as boolean)}
                />
                <label htmlFor="errors" className="text-sm">Error Handling</label>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateDocumentation}
            disabled={isGenerating || (!codeInput.trim() && !projectName.trim())}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-500"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Documentation...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Documentation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview Panel */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Preview
            </CardTitle>
            {generatedContent && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button onClick={handleDownload} size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {generatedContent ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div 
                className="bg-muted/30 rounded-lg p-4 overflow-auto max-h-[600px] prose prose-sm prose-invert max-w-none"
              >
                <pre className="whitespace-pre-wrap text-sm font-mono">{generatedContent}</pre>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                {generatedContent.split('\n').length} lines | {generatedContent.length} characters
              </div>
            </motion.div>
          ) : (
            <div className="h-96 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generate documentation to preview</p>
                <p className="text-xs mt-2">Supports API docs, READMEs, and more</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
