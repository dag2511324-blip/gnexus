import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Artifact, Message, ProjectContext, Persona, JTBD, Journey, Flow, Wireframe, ComponentSpec, Microcopy, Handoff, MarketResearch, CompetitorAnalysis, TrendAnalysis } from '@/types/gnexus';

// Export data as JSON file
export function exportToJSON(data: unknown, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  saveAs(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
}

// Export text as Markdown file
export function exportToMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  saveAs(blob, filename.endsWith('.md') ? filename : `${filename}.md`);
}

// Export text as TXT file
export function exportToText(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  saveAs(blob, filename.endsWith('.txt') ? filename : `${filename}.txt`);
}

// Download base64 data URL as file
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (e) {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

// Convert artifact to Markdown
export function artifactToMarkdown(artifact: Artifact): string {
  switch (artifact.type) {
    case 'persona':
      return personaToMarkdown(artifact as Persona);
    case 'jtbd':
      return jtbdToMarkdown(artifact as JTBD);
    case 'journey':
      return journeyToMarkdown(artifact as Journey);
    case 'flow':
      return flowToMarkdown(artifact as Flow);
    case 'wireframe':
      return wireframeToMarkdown(artifact as Wireframe);
    case 'component':
      return componentToMarkdown(artifact as ComponentSpec);
    case 'microcopy':
      return microcopyToMarkdown(artifact as Microcopy);
    case 'handoff':
      return handoffToMarkdown(artifact as Handoff);
    case 'market-research':
      return marketResearchToMarkdown(artifact as MarketResearch);
    case 'competitor-analysis':
      return competitorAnalysisToMarkdown(artifact as CompetitorAnalysis);
    case 'trend-analysis':
      return trendAnalysisToMarkdown(artifact as TrendAnalysis);
    default:
      return `# ${(artifact as unknown as { name?: string }).name || 'Artifact'}\n\n\`\`\`json\n${JSON.stringify(artifact, null, 2)}\n\`\`\``;
  }
}

// Persona to Markdown
function personaToMarkdown(persona: Persona): string {
  return `# Persona: ${persona.name}

## Overview
- **Role:** ${persona.role}
- **Category:** ${persona.category}
- **Environment:** ${persona.environment}
- **Accessibility:** ${persona.accessibility}

## Goals
${persona.goals.map(g => `- ${g}`).join('\n')}

## Behaviors
${persona.behaviors.map(b => `- ${b}`).join('\n')}

## Pain Points
${persona.painPoints.map(p => `- ${p}`).join('\n')}

---
*Generated on ${new Date(persona.createdAt).toLocaleDateString()}*
`;
}

// JTBD to Markdown
function jtbdToMarkdown(jtbd: JTBD): string {
  return `# Jobs-To-Be-Done: ${jtbd.userType}

## Job Statement
> ${jtbd.jobStatement}

## Functional Jobs
${jtbd.functionalJobs.map(j => `- ${j}`).join('\n')}

## Emotional Jobs
${jtbd.emotionalJobs.map(j => `- ${j}`).join('\n')}

## Social Jobs
${jtbd.socialJobs.map(j => `- ${j}`).join('\n')}

## Desired Outcomes
${jtbd.outcomes.map(o => `- ${o}`).join('\n')}

---
*Generated on ${new Date(jtbd.createdAt).toLocaleDateString()}*
`;
}

// Journey to Markdown
function journeyToMarkdown(journey: Journey): string {
  const stagesTable = journey.stages.map(stage => {
    return `### ${stage.name}

**User Goals:**
${stage.userGoals.map(g => `- ${g}`).join('\n')}

**Actions:**
${stage.actions.map(a => `- ${a}`).join('\n')}

**Emotions:** ${stage.emotions}

**Pain Points:**
${stage.painPoints.map(p => `- ${p}`).join('\n')}

**Opportunities:**
${stage.opportunities.map(o => `- ${o}`).join('\n')}
`;
  }).join('\n');

  return `# User Journey: ${journey.goal}

## Overview
- **Goal:** ${journey.goal}
- **Total Stages:** ${journey.stages.length}

## Journey Stages

${stagesTable}

---
*Generated on ${new Date(journey.createdAt).toLocaleDateString()}*
`;
}

// Flow to Markdown with Mermaid
function flowToMarkdown(flow: Flow): string {
  const mermaidSteps = flow.steps.map(step => {
    if (step.type === 'decision') {
      return `    ${step.id}{{${step.description}}}`;
    } else if (step.type === 'end') {
      return `    ${step.id}((${step.description}))`;
    }
    return `    ${step.id}[${step.description}]`;
  }).join('\n');

  const connections = flow.steps.flatMap(step => {
    if (step.branches) {
      return step.branches.map(b => `    ${step.id} -->|${b.condition}| ${b.nextStep}`);
    }
    const nextId = step.id + 1;
    if (flow.steps.find(s => s.id === nextId)) {
      return [`    ${step.id} --> ${nextId}`];
    }
    return [];
  }).join('\n');

  return `# User Flow: ${flow.name}

## Overview
- **Description:** ${flow.description}
- **Primary Actor:** ${flow.primaryActor}
- **Goal:** ${flow.goal}

## Flow Diagram

\`\`\`mermaid
graph TD
${mermaidSteps}
${connections}
\`\`\`

## Steps Detail

${flow.steps.map(s => `${s.id}. **${s.type === 'decision' ? '(Decision) ' : s.type === 'end' ? '(End) ' : ''}${s.description}**`).join('\n')}

---
*Generated on ${new Date(flow.createdAt).toLocaleDateString()}*
`;
}

// Wireframe to Markdown
function wireframeToMarkdown(wireframe: Wireframe): string {
  const sections = wireframe.sections.map(section => {
    return `### ${section.name}

${section.content}

**Interactive Elements:**
${section.interactiveElements.map(e => `- ${e}`).join('\n')}

**States:**
${section.states.map(s => `- ${s}`).join('\n')}

**Notes:** ${section.notes}
`;
  }).join('\n');

  return `# Wireframe: ${wireframe.screenName}

## Purpose
${wireframe.purpose}

## Sections

${sections}

---
*Generated on ${new Date(wireframe.createdAt).toLocaleDateString()}*
`;
}

// Component to Markdown
function componentToMarkdown(component: ComponentSpec): string {
  const propsTable = component.props.length > 0
    ? `| Name | Type | Description |
|------|------|-------------|
${component.props.map(p => `| ${p.name} | \`${p.type}\` | ${p.description} |`).join('\n')}`
    : 'No props defined.';

  return `# Component: ${component.name}

## Purpose
${component.purpose}

## Props

${propsTable}

## Variants
${component.variants.map(v => `- ${v}`).join('\n')}

## States
${component.states.map(s => `- ${s}`).join('\n')}

## Accessibility Notes
${component.accessibilityNotes}

---
*Generated on ${new Date(component.createdAt).toLocaleDateString()}*
`;
}

// Microcopy to Markdown
function microcopyToMarkdown(microcopy: Microcopy): string {
  const variations = microcopy.variations.map((v, i) => {
    return `### Option ${i + 1}
> "${v.text}"

**Rationale:** ${v.rationale}
`;
  }).join('\n');

  return `# Microcopy: ${microcopy.element}

## Context
${microcopy.context}

## Variations

${variations}

## Best Practices
${microcopy.bestPractices.map(b => `- ${b}`).join('\n')}

---
*Generated on ${new Date(microcopy.createdAt).toLocaleDateString()}*
`;
}

// Handoff to Markdown
function handoffToMarkdown(handoff: Handoff): string {
  return `# Developer Handoff: ${handoff.componentOrScreen}

## Technical Specifications
${handoff.technicalSpecs}

## States
${handoff.states.map(s => `- ${s}`).join('\n')}

## Edge Cases
${handoff.edgeCases.map(e => `- ${e}`).join('\n')}

## API Considerations
${handoff.apiConsiderations}

---
*Generated on ${new Date(handoff.createdAt).toLocaleDateString()}*
`;
}

// Market Research to Markdown
function marketResearchToMarkdown(research: MarketResearch): string {
  return `# Market Research: ${research.category}

## Overview
${research.overview}

## Key Trends
${research.trends.map(t => `- ${t}`).join('\n')}

## Key Players
${research.keyPlayers.map(p => `- ${p}`).join('\n')}

## Opportunities
${research.opportunities.map(o => `- ${o}`).join('\n')}

---
*Generated on ${new Date(research.createdAt).toLocaleDateString()}*
`;
}

// Competitor Analysis to Markdown
function competitorAnalysisToMarkdown(analysis: CompetitorAnalysis): string {
  const competitors = analysis.competitors.map(comp => {
    return `### ${comp.name}

**Strengths:**
${comp.pros.map(p => `- ✅ ${p}`).join('\n')}

**Weaknesses:**
${comp.cons.map(c => `- ❌ ${c}`).join('\n')}

**Key Features:**
${comp.features.map(f => `- ${f}`).join('\n')}
`;
  }).join('\n');

  return `# Competitor Analysis

## Competitors

${competitors}

---
*Generated on ${new Date(analysis.createdAt).toLocaleDateString()}*
`;
}

// Trend Analysis to Markdown
function trendAnalysisToMarkdown(trend: TrendAnalysis): string {
  return `# Trend Analysis: ${trend.industry}

## Emerging Patterns
${trend.emergingPatterns.map(p => `- ${p}`).join('\n')}

## Predictions
${trend.predictions.map(p => `- ${p}`).join('\n')}

## Recommendations
${trend.recommendations.map(r => `- ${r}`).join('\n')}

---
*Generated on ${new Date(trend.createdAt).toLocaleDateString()}*
`;
}

// Export all artifacts as ZIP
export async function exportAllArtifactsZIP(
  artifacts: Artifact[],
  projectName: string,
  includeMessages: boolean = false,
  messages: Message[] = []
): Promise<void> {
  const zip = new JSZip();
  const timestamp = new Date().toISOString().split('T')[0];
  const folderName = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`;

  const mainFolder = zip.folder(folderName);
  if (!mainFolder) return;

  // Create subfolders by artifact type
  const artifactsByType: Record<string, Artifact[]> = {};
  artifacts.forEach(artifact => {
    if (!artifactsByType[artifact.type]) {
      artifactsByType[artifact.type] = [];
    }
    artifactsByType[artifact.type].push(artifact);
  });

  // Add artifacts organized by type
  for (const [type, typeArtifacts] of Object.entries(artifactsByType)) {
    const typeFolder = mainFolder.folder(type);
    if (!typeFolder) continue;

    typeArtifacts.forEach((artifact, index) => {
      const name = (artifact as unknown as { name?: string }).name || `${type}_${index + 1}`;
      const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');

      // Add JSON version
      typeFolder.file(`${safeName}.json`, JSON.stringify(artifact, null, 2));

      // Add Markdown version
      typeFolder.file(`${safeName}.md`, artifactToMarkdown(artifact));
    });
  }

  // Add messages if requested
  if (includeMessages && messages.length > 0) {
    const messagesFolder = mainFolder.folder('chat_history');
    if (messagesFolder) {
      // JSON version
      messagesFolder.file('messages.json', JSON.stringify(messages, null, 2));

      // Markdown version
      const messagesMd = messages.map(m => {
        return `## ${m.role === 'user' ? '👤 User' : '🤖 Assistant'}\n*${new Date(m.timestamp).toLocaleString()}*\n\n${m.content}`;
      }).join('\n\n---\n\n');
      messagesFolder.file('messages.md', `# Chat History\n\n${messagesMd}`);
    }
  }

  // Add summary README
  const readme = `# ${projectName} - Export Summary

Generated on: ${new Date().toLocaleString()}

## Contents

| Type | Count |
|------|-------|
${Object.entries(artifactsByType).map(([type, arr]) => `| ${type} | ${arr.length} |`).join('\n')}
| **Total Artifacts** | **${artifacts.length}** |
${includeMessages ? `| Chat Messages | ${messages.length} |` : ''}

## Usage

Each artifact is available in both JSON (for programmatic use) and Markdown (for documentation) formats.

---
*Exported from GNEXUS AI Design Orchestrator*
`;
  mainFolder.file('README.md', readme);

  // Generate and download ZIP
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${folderName}.zip`);
}

// Export project summary as Markdown
export function exportProjectSummary(
  project: ProjectContext,
  artifacts: Artifact[],
  messages: Message[]
): string {
  const artifactCounts: Record<string, number> = {};
  artifacts.forEach(a => {
    artifactCounts[a.type] = (artifactCounts[a.type] || 0) + 1;
  });

  return `# Project Summary: ${project.name}

## Project Overview
- **Product Type:** ${project.productType || 'Not specified'}
- **Platforms:** ${project.platforms.join(', ') || 'Not specified'}
- **Business Model:** ${project.businessModel || 'Not specified'}
- **Target Audience:** ${project.targetAudience || 'Not specified'}

## Session Statistics
- **Total Messages:** ${messages.length}
- **Total Artifacts:** ${artifacts.length}

## Artifacts by Type
${Object.entries(artifactCounts).map(([type, count]) => `- **${type}:** ${count}`).join('\n')}

## Generated Artifacts

${artifacts.map(artifact => {
    const name = (artifact as unknown as { name?: string }).name || artifact.type;
    return `### ${name}
- **Type:** ${artifact.type}
- **Created:** ${new Date((artifact as unknown as { createdAt: string }).createdAt).toLocaleString()}
`;
  }).join('\n')}

---
*Generated by GNEXUS AI Design Orchestrator on ${new Date().toLocaleString()}*
`;
}

// Get file extension from data URL
export function getExtensionFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/data:([^;]+);/);
  if (!match) return 'bin';

  const mimeType = match[1];
  const mimeMap: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'audio/wav': 'wav',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
  };

  return mimeMap[mimeType] || 'bin';
}
