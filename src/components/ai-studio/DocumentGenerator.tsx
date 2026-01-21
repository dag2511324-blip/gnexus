import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, FileSpreadsheet, Presentation, FileCode, 
  Download, Loader2, Sparkles, Settings, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateDocument, 
  downloadDocument, 
  DocumentType, 
  OutputFormat, 
  DocumentSection 
} from '@/lib/document-utils';

const DOCUMENT_TYPES: { id: DocumentType; label: string; icon: typeof FileText; description: string }[] = [
  { id: 'report', label: 'Report', icon: FileText, description: 'Business reports, analysis documents' },
  { id: 'presentation', label: 'Presentation', icon: Presentation, description: 'Slide decks, pitch presentations' },
  { id: 'article', label: 'Article', icon: FileText, description: 'Blog posts, white papers' },
  { id: 'code-docs', label: 'Code Docs', icon: FileCode, description: 'API docs, technical specifications' },
  { id: 'letter', label: 'Letter', icon: FileText, description: 'Formal letters, cover letters' },
  { id: 'invoice', label: 'Invoice', icon: FileSpreadsheet, description: 'Invoices, receipts' },
];

const OUTPUT_FORMATS: { id: OutputFormat; label: string; extension: string }[] = [
  { id: 'pdf', label: 'PDF', extension: '.pdf' },
  { id: 'docx', label: 'Word', extension: '.docx' },
  { id: 'pptx', label: 'PowerPoint', extension: '.pptx' },
  { id: 'txt', label: 'Plain Text', extension: '.txt' },
  { id: 'md', label: 'Markdown', extension: '.md' },
];

export function DocumentGenerator() {
  const [documentType, setDocumentType] = useState<DocumentType>('report');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('pdf');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [author, setAuthor] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [sections, setSections] = useState<DocumentSection[]>([]);
  
  // Options
  const [includeTableOfContents, setIncludeTableOfContents] = useState(true);
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [includeCoverPage, setIncludeCoverPage] = useState(true);
  
  const { toast } = useToast();

  const generateContentWithAI = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Please enter a topic or prompt', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);

    try {
      const systemPrompt = getSystemPromptForType(documentType);
      
      const { data, error } = await supabase.functions.invoke('openrouter-chat', {
        body: {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Create a ${documentType} about: ${prompt}\n\nTitle: ${title || prompt}` }
          ],
          model: 'qwen/qwen-2.5-7b-instruct:free',
        }
      });

      if (error) throw error;

      const content = data?.content || data?.text || '';
      setGeneratedContent(content);
      
      // Parse content into sections
      const parsedSections = parseContentToSections(content, documentType);
      setSections(parsedSections);
      
      if (!title && prompt) {
        setTitle(prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''));
      }

      toast({ title: 'Content generated successfully!' });
    } catch (error) {
      console.error('Generation error:', error);
      toast({ title: 'Failed to generate content', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const parseContentToSections = (content: string, type: DocumentType): DocumentSection[] => {
    const sections: DocumentSection[] = [];
    const lines = content.split('\n');
    let currentParagraph = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Detect headings (# or ## style, or all caps with colon)
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
      } else if (trimmedLine.startsWith('```')) {
        if (currentParagraph) {
          sections.push({ title: '', content: currentParagraph.trim(), type: 'paragraph' });
          currentParagraph = '';
        }
        // Find the end of code block
        const codeStart = lines.indexOf(line) + 1;
        let codeEnd = codeStart;
        for (let i = codeStart; i < lines.length; i++) {
          if (lines[i].trim().startsWith('```')) {
            codeEnd = i;
            break;
          }
        }
        const codeContent = lines.slice(codeStart, codeEnd).join('\n');
        sections.push({ title: 'Code', content: codeContent, type: 'code' });
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        if (currentParagraph) {
          sections.push({ title: '', content: currentParagraph.trim(), type: 'paragraph' });
          currentParagraph = '';
        }
        // Collect list items
        const listItems: string[] = [trimmedLine.slice(2)];
        const startIdx = lines.indexOf(line);
        for (let i = startIdx + 1; i < lines.length; i++) {
          const nextLine = lines[i].trim();
          if (nextLine.startsWith('- ') || nextLine.startsWith('* ')) {
            listItems.push(nextLine.slice(2));
          } else {
            break;
          }
        }
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

  const getSystemPromptForType = (type: DocumentType): string => {
    const prompts: Record<DocumentType, string> = {
      'report': `You are a professional business writer. Generate a comprehensive report with clear sections including:
        - Executive Summary
        - Introduction
        - Main findings/analysis (with subsections)
        - Recommendations
        - Conclusion
        Use markdown formatting with # for main headings and ## for subheadings.`,
      'presentation': `You are a presentation designer. Create engaging slide content with:
        - Title slide concept
        - Key points (3-5 per section)
        - Clear, concise bullet points
        - Speaker notes for each slide
        Use # for slide titles and bullet points for content.`,
      'article': `You are a professional content writer. Create an engaging article with:
        - Compelling introduction
        - Well-structured body paragraphs
        - Supporting examples
        - Strong conclusion
        Use markdown formatting for headings and emphasis.`,
      'code-docs': `You are a technical writer. Generate comprehensive documentation including:
        - Overview/Introduction
        - Installation/Setup
        - API Reference (with code examples)
        - Usage examples
        - Troubleshooting
        Use markdown with code blocks (\`\`\`) for code examples.`,
      'letter': `You are a professional letter writer. Create a formal letter with:
        - Proper letterhead format
        - Clear opening
        - Well-organized body
        - Professional closing
        Follow standard business letter conventions.`,
      'invoice': `You are a financial document generator. Create an invoice structure with:
        - Company information placeholder
        - Client details section
        - Itemized list format
        - Totals and terms
        Use clear, organized formatting.`,
    };
    return prompts[type];
  };

  const handleDownload = async () => {
    if (!generatedContent && !sections.length) {
      toast({ title: 'Please generate content first', variant: 'destructive' });
      return;
    }

    try {
      const blob = await generateDocument({
        title: title || 'Untitled Document',
        content: generatedContent,
        type: documentType,
        format: outputFormat,
        author: author || undefined,
        includeTableOfContents,
        includePageNumbers,
        includeCoverPage,
        sections: sections.length > 0 ? sections : undefined,
      });

      const format = OUTPUT_FORMATS.find(f => f.id === outputFormat);
      const filename = `${title || 'document'}-${Date.now()}${format?.extension || '.pdf'}`;
      downloadDocument(blob, filename);
      
      toast({ title: `Document downloaded as ${format?.label}!` });
    } catch (error) {
      console.error('Download error:', error);
      toast({ title: 'Failed to generate document', variant: 'destructive' });
    }
  };

  const currentDocType = DOCUMENT_TYPES.find(t => t.id === documentType);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Type */}
          <div className="space-y-2">
            <Label>Document Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {DOCUMENT_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.id}
                    variant={documentType === type.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDocumentType(type.id)}
                    className={`flex flex-col h-auto py-2 ${documentType === type.id ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : ''}`}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="text-xs">{type.label}</span>
                  </Button>
                );
              })}
            </div>
            {currentDocType && (
              <p className="text-xs text-muted-foreground">{currentDocType.description}</p>
            )}
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <Label>Output Format</Label>
            <div className="flex gap-2">
              {OUTPUT_FORMATS.map((format) => (
                <Button
                  key={format.id}
                  variant={outputFormat === format.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOutputFormat(format.id)}
                  disabled={format.id === 'pptx' && documentType !== 'presentation'}
                >
                  {format.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>Document Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title..."
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label>Author (optional)</Label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name..."
            />
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label>Topic / Content Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what the document should be about..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>Options</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="toc"
                  checked={includeTableOfContents}
                  onCheckedChange={(checked) => setIncludeTableOfContents(checked as boolean)}
                />
                <label htmlFor="toc" className="text-sm">Include Table of Contents</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pages"
                  checked={includePageNumbers}
                  onCheckedChange={(checked) => setIncludePageNumbers(checked as boolean)}
                />
                <label htmlFor="pages" className="text-sm">Include Page Numbers</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="cover"
                  checked={includeCoverPage}
                  onCheckedChange={(checked) => setIncludeCoverPage(checked as boolean)}
                />
                <label htmlFor="cover" className="text-sm">Include Cover Page</label>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateContentWithAI}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate with AI
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
              <Eye className="h-5 w-5" />
              Preview
            </CardTitle>
            {generatedContent && (
              <Button onClick={handleDownload} className="bg-gradient-to-r from-green-500 to-emerald-500">
                <Download className="h-4 w-4 mr-2" />
                Download {OUTPUT_FORMATS.find(f => f.id === outputFormat)?.label}
              </Button>
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
              {/* A4 Preview */}
              <div 
                className="bg-white text-black rounded-lg shadow-lg overflow-auto"
                style={{ 
                  aspectRatio: '210 / 297', 
                  maxHeight: '600px',
                  padding: '40px',
                }}
              >
                {includeCoverPage && (
                  <div className="text-center mb-8 pb-8 border-b border-gray-200">
                    <h1 className="text-2xl font-bold mb-4">{title || 'Untitled Document'}</h1>
                    {author && <p className="text-gray-600">By {author}</p>}
                    <p className="text-gray-500 text-sm mt-2">{new Date().toLocaleDateString()}</p>
                  </div>
                )}
                
                <div className="prose prose-sm max-w-none">
                  {sections.map((section, index) => (
                    <div key={index} className="mb-4">
                      {section.type === 'heading' && (
                        <h2 
                          className="font-bold text-gray-900"
                          style={{ fontSize: `${20 - ((section.level || 1) - 1) * 2}px` }}
                        >
                          {section.title}
                        </h2>
                      )}
                      {section.type === 'paragraph' && (
                        <p className="text-gray-700 leading-relaxed">{section.content}</p>
                      )}
                      {section.type === 'list' && (
                        <ul className="list-disc list-inside text-gray-700">
                          {section.content.split('\n').map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                      {section.type === 'code' && (
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                          <code>{section.content}</code>
                        </pre>
                      )}
                    </div>
                  ))}
                  
                  {sections.length === 0 && (
                    <div className="whitespace-pre-wrap text-gray-700">{generatedContent}</div>
                  )}
                </div>
              </div>

              {/* Word count */}
              <div className="text-xs text-muted-foreground text-center">
                {generatedContent.split(/\s+/).length} words | {sections.length} sections
              </div>
            </motion.div>
          ) : (
            <div className="h-96 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generate content to preview your document</p>
                <p className="text-xs mt-2">Supports PDF, Word, PowerPoint, and more</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
