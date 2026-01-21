import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PptxGenJS from 'pptxgenjs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber, BorderStyle } from 'docx';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF;
  }
}

export type DocumentType = 'report' | 'presentation' | 'article' | 'code-docs' | 'letter' | 'invoice';
export type OutputFormat = 'pdf' | 'docx' | 'pptx' | 'txt' | 'md';

export interface DocumentOptions {
  title: string;
  content: string;
  type: DocumentType;
  format: OutputFormat;
  author?: string;
  includeTableOfContents?: boolean;
  includePageNumbers?: boolean;
  includeCoverPage?: boolean;
  fontSize?: number;
  fontFamily?: string;
  sections?: DocumentSection[];
}

export interface DocumentSection {
  title: string;
  content: string;
  type: 'heading' | 'paragraph' | 'code' | 'list' | 'table';
  level?: number;
}

// A4 dimensions in points (72 points per inch)
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 40;

export async function generatePDF(options: DocumentOptions): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  let yPosition = MARGIN;
  const lineHeight = options.fontSize || 12;
  const pageWidth = A4_WIDTH - MARGIN * 2;

  // Cover page
  if (options.includeCoverPage) {
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text(options.title, A4_WIDTH / 2, A4_HEIGHT / 3, { align: 'center' });

    if (options.author) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`By ${options.author}`, A4_WIDTH / 2, A4_HEIGHT / 2, { align: 'center' });
    }

    pdf.setFontSize(12);
    pdf.text(new Date().toLocaleDateString(), A4_WIDTH / 2, A4_HEIGHT / 2 + 40, { align: 'center' });

    pdf.addPage();
    yPosition = MARGIN;
  }

  // Table of Contents
  if (options.includeTableOfContents && options.sections) {
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Table of Contents', MARGIN, yPosition);
    yPosition += 40;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    options.sections.forEach((section, index) => {
      if (section.type === 'heading') {
        const indent = (section.level || 1) * 20;
        pdf.text(`${index + 1}. ${section.title}`, MARGIN + indent, yPosition);
        yPosition += lineHeight + 5;
      }
    });

    pdf.addPage();
    yPosition = MARGIN;
  }

  // Title
  if (!options.includeCoverPage) {
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(options.title, MARGIN, yPosition);
    yPosition += 40;
  }

  // Content sections
  if (options.sections) {
    for (const section of options.sections) {
      if (yPosition > A4_HEIGHT - MARGIN * 2) {
        pdf.addPage();
        yPosition = MARGIN;
      }

      switch (section.type) {
        case 'heading': {
          const headingSize = 24 - ((section.level || 1) - 1) * 4;
          pdf.setFontSize(headingSize);
          pdf.setFont('helvetica', 'bold');
          pdf.text(section.title, MARGIN, yPosition);
          yPosition += headingSize + 10;
          break;
        }

        case 'paragraph': {
          pdf.setFontSize(lineHeight);
          pdf.setFont('helvetica', 'normal');
          const lines = pdf.splitTextToSize(section.content, pageWidth);
          pdf.text(lines, MARGIN, yPosition);
          yPosition += lines.length * (lineHeight + 3) + 15;
          break;
        }

        case 'code': {
          pdf.setFontSize(10);
          pdf.setFont('courier', 'normal');
          pdf.setFillColor(240, 240, 240);
          const codeLines = section.content.split('\n');
          const codeHeight = codeLines.length * 12 + 20;
          pdf.rect(MARGIN - 5, yPosition - 15, pageWidth + 10, codeHeight, 'F');
          codeLines.forEach((line, i) => {
            pdf.text(line, MARGIN, yPosition + i * 12);
          });
          yPosition += codeHeight + 10;
          break;
        }

        case 'list': {
          pdf.setFontSize(lineHeight);
          pdf.setFont('helvetica', 'normal');
          section.content.split('\n').forEach((item) => {
            pdf.text(`• ${item}`, MARGIN + 10, yPosition);
            yPosition += lineHeight + 5;
          });
          yPosition += 10;
          break;
        }
      }
    }
  } else {
    // Plain content
    pdf.setFontSize(lineHeight);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(options.content, pageWidth);

    for (let i = 0; i < lines.length; i++) {
      if (yPosition > A4_HEIGHT - MARGIN) {
        pdf.addPage();
        yPosition = MARGIN;
      }
      pdf.text(lines[i], MARGIN, yPosition);
      yPosition += lineHeight + 3;
    }
  }

  // Page numbers
  if (options.includePageNumbers) {
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Page ${i} of ${pageCount}`, A4_WIDTH / 2, A4_HEIGHT - 20, { align: 'center' });
    }
  }

  return pdf.output('blob');
}

export async function generateDOCX(options: DocumentOptions): Promise<Blob> {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: options.title, bold: true, size: 48 })],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Author and date
  if (options.author) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `By ${options.author}`, italics: true, size: 24 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: new Date().toLocaleDateString(), size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    })
  );

  // Sections
  if (options.sections) {
    for (const section of options.sections) {
      switch (section.type) {
        case 'heading':
          children.push(
            new Paragraph({
              children: [new TextRun({ text: section.title, bold: true, size: 32 - ((section.level || 1) - 1) * 4 })],
              heading: section.level === 1 ? HeadingLevel.HEADING_1 :
                section.level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
              spacing: { before: 300, after: 200 },
            })
          );
          break;

        case 'paragraph':
          children.push(
            new Paragraph({
              children: [new TextRun({ text: section.content, size: 24 })],
              spacing: { after: 200 },
            })
          );
          break;

        case 'code':
          section.content.split('\n').forEach(line => {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: line, font: 'Courier New', size: 20 })],
                shading: { fill: 'F0F0F0' },
                spacing: { after: 40 },
              })
            );
          });
          break;

        case 'list':
          section.content.split('\n').forEach(item => {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: item, size: 24 })],
                bullet: { level: 0 },
                spacing: { after: 100 },
              })
            );
          });
          break;
      }
    }
  } else {
    options.content.split('\n\n').forEach(para => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: para, size: 24 })],
          spacing: { after: 200 },
        })
      );
    });
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4 in twips
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: options.includeCoverPage ? {
        default: new Header({
          children: [new Paragraph({ children: [new TextRun({ text: options.title, size: 20 })] })],
        }),
      } : undefined,
      footers: options.includePageNumbers ? {
        default: new Footer({
          children: [
            new Paragraph({
              children: [new TextRun({ children: [PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES] })],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      } : undefined,
      children,
    }],
  });

  return await Packer.toBlob(doc);
}

export async function generatePPTX(options: DocumentOptions): Promise<Blob> {
  const pptx = new PptxGenJS();

  pptx.author = options.author || 'AI Studio';
  pptx.title = options.title;
  pptx.layout = 'LAYOUT_16x9';

  // Title slide
  const titleSlide = pptx.addSlide();
  titleSlide.addText(options.title, {
    x: 0.5,
    y: 2,
    w: '90%',
    h: 1.5,
    fontSize: 44,
    bold: true,
    align: 'center',
    color: '363636',
  });

  if (options.author) {
    titleSlide.addText(options.author, {
      x: 0.5,
      y: 4,
      w: '90%',
      h: 0.5,
      fontSize: 20,
      align: 'center',
      color: '666666',
    });
  }

  // Content slides
  if (options.sections) {
    let currentSlide = pptx.addSlide();
    let yPos = 1;

    for (const section of options.sections) {
      if (section.type === 'heading' && section.level === 1) {
        // New slide for major headings
        currentSlide = pptx.addSlide();
        currentSlide.addText(section.title, {
          x: 0.5,
          y: 0.5,
          w: '90%',
          h: 0.8,
          fontSize: 32,
          bold: true,
          color: '363636',
        });
        yPos = 1.5;
      } else if (section.type === 'paragraph') {
        if (yPos > 5) {
          currentSlide = pptx.addSlide();
          yPos = 0.5;
        }
        currentSlide.addText(section.content, {
          x: 0.5,
          y: yPos,
          w: '90%',
          h: 1,
          fontSize: 18,
          color: '4a4a4a',
          valign: 'top',
        });
        yPos += 1.2;
      } else if (section.type === 'list') {
        const items = section.content.split('\n');
        currentSlide.addText(items.map(item => ({ text: item, options: { bullet: true } })), {
          x: 0.5,
          y: yPos,
          w: '90%',
          h: items.length * 0.4,
          fontSize: 16,
          color: '4a4a4a',
        });
        yPos += items.length * 0.4 + 0.3;
      }
    }
  } else {
    // Split content into slides
    const paragraphs = options.content.split('\n\n');
    let slideContent: string[] = [];

    for (const para of paragraphs) {
      slideContent.push(para);

      if (slideContent.length >= 3) {
        const slide = pptx.addSlide();
        let y = 0.5;
        slideContent.forEach(text => {
          slide.addText(text, {
            x: 0.5,
            y,
            w: '90%',
            h: 1.5,
            fontSize: 18,
            color: '4a4a4a',
          });
          y += 1.7;
        });
        slideContent = [];
      }
    }

    // Remaining content
    if (slideContent.length > 0) {
      const slide = pptx.addSlide();
      let y = 0.5;
      slideContent.forEach(text => {
        slide.addText(text, {
          x: 0.5,
          y,
          w: '90%',
          h: 1.5,
          fontSize: 18,
          color: '4a4a4a',
        });
        y += 1.7;
      });
    }
  }

  return await pptx.write({ outputType: 'blob' }) as Blob;
}

export function generateTXT(options: DocumentOptions): Blob {
  let content = `${options.title}\n${'='.repeat(options.title.length)}\n\n`;

  if (options.author) {
    content += `Author: ${options.author}\nDate: ${new Date().toLocaleDateString()}\n\n`;
  }

  if (options.sections) {
    for (const section of options.sections) {
      switch (section.type) {
        case 'heading': {
          const underline = section.level === 1 ? '=' : section.level === 2 ? '-' : '~';
          content += `\n${section.title}\n${underline.repeat(section.title.length)}\n\n`;
          break;
        }
        case 'paragraph':
          content += `${section.content}\n\n`;
          break;
        case 'code':
          content += `\`\`\`\n${section.content}\n\`\`\`\n\n`;
          break;
        case 'list':
          section.content.split('\n').forEach(item => {
            content += `  * ${item}\n`;
          });
          content += '\n';
          break;
      }
    }
  } else {
    content += options.content;
  }

  return new Blob([content], { type: 'text/plain' });
}

export function generateMarkdown(options: DocumentOptions): Blob {
  let content = `# ${options.title}\n\n`;

  if (options.author) {
    content += `*By ${options.author} | ${new Date().toLocaleDateString()}*\n\n---\n\n`;
  }

  if (options.includeTableOfContents && options.sections) {
    content += '## Table of Contents\n\n';
    options.sections.forEach((section, i) => {
      if (section.type === 'heading') {
        const indent = '  '.repeat((section.level || 1) - 1);
        const slug = section.title.toLowerCase().replace(/\s+/g, '-');
        content += `${indent}- [${section.title}](#${slug})\n`;
      }
    });
    content += '\n---\n\n';
  }

  if (options.sections) {
    for (const section of options.sections) {
      switch (section.type) {
        case 'heading':
          content += `${'#'.repeat(section.level || 1)} ${section.title}\n\n`;
          break;
        case 'paragraph':
          content += `${section.content}\n\n`;
          break;
        case 'code':
          content += `\`\`\`\n${section.content}\n\`\`\`\n\n`;
          break;
        case 'list':
          section.content.split('\n').forEach(item => {
            content += `- ${item}\n`;
          });
          content += '\n';
          break;
      }
    }
  } else {
    content += options.content;
  }

  return new Blob([content], { type: 'text/markdown' });
}

export async function generateDocument(options: DocumentOptions): Promise<Blob> {
  switch (options.format) {
    case 'pdf':
      return generatePDF(options);
    case 'docx':
      return generateDOCX(options);
    case 'pptx':
      return generatePPTX(options);
    case 'txt':
      return generateTXT(options);
    case 'md':
      return generateMarkdown(options);
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }
}

export function downloadDocument(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
