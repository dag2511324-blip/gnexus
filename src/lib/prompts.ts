import { ProjectContext, Persona } from "@/types/gnexus";

// Main GNEXUS system prompt
export const GNEXUS_SYSTEM_PROMPT = `You are "GNEXUS", an advanced AI Design Orchestrator specializing in:
- Product strategy and validation
- UX research & architecture
- Interaction design & user flows
- UI & visual design specifications
- Content/UX writing & microcopy
- Design systems and developer handoff

Your mission is to help transform ideas into validated UX concepts, detailed flows, UI specs, and actionable deliverables.

CORE PRINCIPLES:
- Be concise, structured, and actionable
- Use headings, bullet lists, and tables over prose
- Clarify fuzzy requests with 2-5 targeted questions
- Present major trade-offs as 2-3 clear options with pros/cons
- Every response should move the design forward

UX WORKFLOW PHASES:
- Phase 0: Alignment — Clarify goals, constraints, and scope
- Phase 1: Context & Users — Define audience, personas, JTBD
- Phase 2: Problem & Value — Frame problems and success criteria
- Phase 3: IA & Flows — Navigation, entities, user journeys
- Phase 4: Interaction — Screen specs, states, behaviors
- Phase 5: Visual & Content — UI patterns, hierarchy, microcopy
- Phase 6: Validation & Handoff — Testing, analytics, dev specs

Always be professional and deliver concrete, implementation-ready outputs.`;

// Tool-specific prompts
export const getPersonaPrompt = (context: ProjectContext, description: string) => `
Based on the following product context and user description, generate a detailed user persona.

Product: ${context.name}
Type: ${context.productType}
Platforms: ${context.platforms.join(', ')}
${context.businessModel ? `Business Model: ${context.businessModel}` : ''}

User Description: ${description}

Generate a persona in the following JSON format:
{
  "name": "Full name",
  "role": "Job title/role",
  "initials": "Two letter initials",
  "category": "primary" or "secondary",
  "goals": ["Goal 1", "Goal 2", "Goal 3"],
  "behaviors": ["Behavior 1", "Behavior 2", "Behavior 3"],
  "painPoints": ["Pain point 1", "Pain point 2", "Pain point 3"],
  "environment": "Description of work/use environment and constraints",
  "accessibility": "Accessibility considerations"
}

Respond ONLY with the JSON object, no additional text.`;

export const getJTBDPrompt = (context: ProjectContext, userType: string) => `
Create a Jobs-to-be-Done (JTBD) framework for the following:

Product: ${context.name}
User Type: ${userType}

Generate JTBD in the following JSON format:
{
  "userType": "${userType}",
  "jobStatement": "When [situation], I want to [motivation], so I can [expected outcome]",
  "functionalJobs": ["Functional job 1", "Functional job 2", "Functional job 3"],
  "emotionalJobs": ["How they want to feel"],
  "socialJobs": ["How they want to be perceived"],
  "outcomes": ["Desired outcome 1", "Desired outcome 2", "Desired outcome 3"]
}

Respond ONLY with the JSON object, no additional text.`;

export const getJourneyPrompt = (context: ProjectContext, goal: string, persona?: Persona) => `
Create a user journey map for:

Product: ${context.name}
${persona ? `Persona: ${persona.name} (${persona.role})` : ''}
Goal: ${goal}

Generate a journey in the following JSON format:
{
  "goal": "${goal}",
  "stages": [
    {
      "name": "Stage name (e.g., Discovery, Consideration, Onboarding, Use, Renewal)",
      "userGoals": ["What user wants to achieve"],
      "actions": ["What user does"],
      "emotions": "How user feels (positive/negative/neutral)",
      "painPoints": ["Frustrations encountered"],
      "opportunities": ["How we can improve"]
    }
  ],
  "mermaidChart": "A valid Mermaid.js journey diagram string representing this journey"
}

Include 4-6 stages. Respond ONLY with the JSON object, no additional text.`;

export const getFlowPrompt = (context: ProjectContext, feature: string) => `
Design a user flow for:

Product: ${context.name}
Feature/Task: ${feature}

Generate a flow in the following JSON format:
{
  "name": "Flow name",
  "description": "Brief description",
  "primaryActor": "User type",
  "goal": "What user wants to accomplish",
  "steps": [
    {
      "id": 1,
      "description": "Step description",
      "type": "action" | "decision" | "end",
      "branches": [{"condition": "If yes", "nextStep": 2}]
    }
  ],
  "mermaidChart": "A valid Mermaid.js flowchart string representing this user flow"
}

Include 5-10 steps with decision points where appropriate. Respond ONLY with the JSON object.`;

export const getWireframePrompt = (context: ProjectContext, screenName: string, purpose: string) => `
Create a wireframe specification for:

Product: ${context.name}
Screen: ${screenName}
Purpose: ${purpose}

Generate a wireframe in the following JSON format:
{
  "screenName": "${screenName}",
  "purpose": "${purpose}",
  "sections": [
    {
      "name": "Section name (e.g., Header, Hero, Navigation, Content, Footer)",
      "content": "What content appears here",
      "interactiveElements": ["Button: Label", "Input: Placeholder", "Link: Text"],
      "states": ["Default", "Hover", "Active", "Loading", "Empty", "Error"],
      "notes": "Design notes, validation rules, business logic"
    }
  ],
  "reactCode": "Functional React component code using Tailwind CSS that implements this wireframe. Uselucide-react icons where appropriate. Do not include imports, just the component code."
}

Include all major sections. Respond ONLY with the JSON object.`;

export const getComponentPrompt = (componentName: string, purpose: string) => `
Create a UI component specification for:

Component: ${componentName}
Purpose: ${purpose}

Generate a spec in the following JSON format:
{
  "name": "${componentName}",
  "purpose": "${purpose}",
  "props": [
    {"name": "propName", "type": "string | number | boolean", "description": "What it does"}
  ],
  "variants": ["primary", "secondary", "ghost", "destructive"],
  "states": ["default", "hover", "focus", "active", "disabled", "loading"],
  "accessibilityNotes": "ARIA roles, keyboard navigation, screen reader considerations",
  "reactCode": "Functional React component code using Tailwind CSS and shadcn/ui principles. Do not include imports, just the component code."
}

Respond ONLY with the JSON object.`;

export const getMicrocopyPrompt = (context: string, element: string) => `
Generate UX microcopy for:

Context: ${context}
Element: ${element}

Generate copy in the following JSON format:
{
  "context": "${context}",
  "element": "${element}",
  "variations": [
    {"text": "Copy option 1", "rationale": "Why this works"},
    {"text": "Copy option 2", "rationale": "Why this works"},
    {"text": "Copy option 3", "rationale": "Why this works"}
  ],
  "bestPractices": ["Best practice 1", "Best practice 2", "Best practice 3"]
}

Consider: clarity, brevity, action-oriented language, user emotions. Respond ONLY with the JSON object.`;

export const getHandoffPrompt = (componentOrScreen: string) => `
Create developer handoff specifications for:

Component/Screen: ${componentOrScreen}

Generate handoff in the following JSON format:
{
  "componentOrScreen": "${componentOrScreen}",
  "technicalSpecs": "Implementation details, frameworks, libraries",
  "states": ["State 1: Description", "State 2: Description"],
  "edgeCases": ["Edge case 1", "Edge case 2", "Edge case 3"],
  "apiConsiderations": "API endpoints, data structure, error handling"
}

Be specific and actionable for developers. Respond ONLY with the JSON object.`;

export const getMarketResearchPrompt = (category: string, industry: string) => `
Conduct market research for:

Product Category: ${category}
Industry: ${industry}

Generate research in the following JSON format:
{
  "category": "${category}",
  "overview": "Market overview in 2-3 sentences",
  "trends": ["Trend 1", "Trend 2", "Trend 3", "Trend 4"],
  "keyPlayers": ["Player 1", "Player 2", "Player 3"],
  "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"]
}

Respond ONLY with the JSON object.`;

export const getCompetitorPrompt = (competitors: string) => `
Analyze competitors:

Competitors: ${competitors}

Generate analysis in the following JSON format:
{
  "competitors": [
    {
      "name": "Competitor name",
      "pros": ["Strength 1", "Strength 2"],
      "cons": ["Weakness 1", "Weakness 2"],
      "features": ["Key feature 1", "Key feature 2", "Key feature 3"]
    }
  ]
}

Include 2-4 competitors. Respond ONLY with the JSON object.`;

export const getTrendPrompt = (industry: string) => `
Analyze trends for:

Industry/Area: ${industry}

Generate analysis in the following JSON format:
{
  "industry": "${industry}",
  "emergingPatterns": ["Pattern 1", "Pattern 2", "Pattern 3", "Pattern 4"],
  "predictions": ["Prediction 1", "Prediction 2", "Prediction 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}

Respond ONLY with the JSON object.`;

export const getABTestPrompt = (hypothesis: string, feature: string) => `
Create an A/B test plan for:

Hypothesis: ${hypothesis}
Feature to Test: ${feature}

Generate a test plan in the following JSON format:
{
  "hypothesis": "${hypothesis}",
  "feature": "${feature}",
  "variants": [
    {"name": "Control", "description": "Current implementation"},
    {"name": "Variant A", "description": "Proposed change"}
  ],
  "metrics": {
    "primary": "Primary success metric",
    "secondary": ["Secondary metric 1", "Secondary metric 2"]
  },
  "sampleSize": "Recommended sample size with justification",
  "duration": "Recommended test duration",
  "successCriteria": "What constitutes a successful test"
}

Respond ONLY with the JSON object.`;

export const getAccessibilityPrompt = (component: string, level: string) => `
Create an accessibility checklist for:

Component/Screen: ${component}
WCAG Level: ${level || 'AA'}

Generate a checklist in the following JSON format:
{
  "component": "${component}",
  "wcagLevel": "${level || 'AA'}",
  "checklist": [
    {"criterion": "1.1.1 Non-text Content", "status": "pass/fail/na", "notes": "Implementation notes"},
    {"criterion": "1.4.3 Contrast", "status": "pass/fail/na", "notes": "Implementation notes"}
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "ariaRoles": ["role: purpose"],
  "keyboardNavigation": ["Tab order and focus management notes"]
}

Include 5-10 relevant WCAG criteria. Respond ONLY with the JSON object.`;

export const getColorPalettePrompt = (mood: string, industry: string) => `
Generate a color palette for:

Brand Mood: ${mood}
Industry: ${industry}

Generate a palette in the following JSON format:
{
  "mood": "${mood}",
  "industry": "${industry}",
  "primary": {"name": "Color name", "hex": "#000000", "usage": "When to use"},
  "secondary": {"name": "Color name", "hex": "#000000", "usage": "When to use"},
  "accent": {"name": "Color name", "hex": "#000000", "usage": "When to use"},
  "neutrals": [
    {"name": "Background", "hex": "#FFFFFF"},
    {"name": "Text", "hex": "#1A1A1A"},
    {"name": "Muted", "hex": "#666666"}
  ],
  "semantic": {
    "success": "#00AA00",
    "warning": "#FFAA00",
    "error": "#FF0000",
    "info": "#0066FF"
  },
  "rationale": "Why these colors work for the brand"
}

Respond ONLY with the JSON object.`;

export const getTypographyPrompt = (tone: string, platform: string) => `
Generate a typography system for:

Brand Tone: ${tone}
Primary Platform: ${platform}

Generate typography in the following JSON format:
{
  "tone": "${tone}",
  "platform": "${platform}",
  "fontPairings": {
    "display": {"family": "Font Name", "weight": "700", "style": "normal"},
    "body": {"family": "Font Name", "weight": "400", "style": "normal"},
    "mono": {"family": "Font Name", "weight": "400", "style": "normal"}
  },
  "scale": {
    "h1": {"size": "48px", "lineHeight": "1.2", "weight": "700"},
    "h2": {"size": "36px", "lineHeight": "1.25", "weight": "600"},
    "h3": {"size": "24px", "lineHeight": "1.3", "weight": "600"},
    "body": {"size": "16px", "lineHeight": "1.5", "weight": "400"},
    "small": {"size": "14px", "lineHeight": "1.4", "weight": "400"},
    "caption": {"size": "12px", "lineHeight": "1.4", "weight": "400"}
  },
  "rationale": "Why this typography system works"
}

Respond ONLY with the JSON object.`;

export const getErrorMessagePrompt = (errorType: string, context: string) => `
Generate error messages for:

Error Type: ${errorType}
Context: ${context}

Generate messages in the following JSON format:
{
  "errorType": "${errorType}",
  "context": "${context}",
  "messages": [
    {
      "scenario": "Specific error scenario",
      "title": "Short, clear title",
      "message": "User-friendly explanation",
      "action": "What the user can do to resolve",
      "tone": "empathetic/professional/casual"
    }
  ],
  "bestPractices": ["Best practice 1", "Best practice 2"],
  "antiPatterns": ["What to avoid 1", "What to avoid 2"]
}

Include 3-5 error scenarios. Respond ONLY with the JSON object.`;

export const getOnboardingPrompt = (productType: string, targetUser: string) => `
Design an onboarding flow for:

Product Type: ${productType}
Target User: ${targetUser}

Generate an onboarding flow in the following JSON format:
{
  "productType": "${productType}",
  "targetUser": "${targetUser}",
  "steps": [
    {
      "number": 1,
      "title": "Step title",
      "purpose": "What this step accomplishes",
      "content": "What to show the user",
      "interaction": "How user interacts",
      "skipable": true/false
    }
  ],
  "progressStyle": "dots/bar/steps",
  "estimatedTime": "X minutes",
  "personalizations": ["Data collected for personalization"],
  "metrics": ["Success metrics to track"]
}

Include 4-7 onboarding steps. Respond ONLY with the JSON object.`;

// NEW TOOLS

export const getVideoReviewPrompt = (videoContext: string, aspects: string) => `
Analyze the following video content context:

Context: ${videoContext}
Focus Aspects: ${aspects}

Generate a video review in the following JSON format:
{
  "summary": "Executive summary of the video content",
  "timestamps": [
    {"time": "00:00", "description": "Scene description"}
  ],
  "anomalies": ["Unusual visual element 1", "Audio glitch 2"],
  "recommendations": "Editing or content recommendations"
}
Respond ONLY with the JSON object.`;

export const getTextExtractorPrompt = (imageDescription: string, formatting: string) => `
Extract text from the described image/document:

Image Description/Context: ${imageDescription}
Desired Format: ${formatting}

Generate extraction in the following JSON format:
{
  "extractedText": "The full extracted text...",
  "confidenceScore": 0.95,
  "format": "${formatting}",
  "metadata": "Any detected headers/footers"
}
Respond ONLY with the JSON object.`;

export const getImageCaptionPrompt = (imageDescription: string, tone: string) => `
Generate captions for the image:

Description: ${imageDescription}
Tone: ${tone}

Generate captions in the following JSON format:
{
  "caption": "Primary caption",
  "tags": ["tag1", "tag2", "tag3"],
  "detailedDescription": "A more detailed accessible description for alt text"
}
Respond ONLY with the JSON object.`;

export const getCodeReviewPrompt = (codeSnippet: string, language: string) => `
Review the following ${language} code:

Code:
${codeSnippet}

Generate a review in the following JSON format:
{
  "fileName": "suggested_filename.${language}",
  "summary": "High-level summary of code quality",
  "issues": [
    {"severity": "high", "line": 10, "description": "Issue description", "suggestion": "Fix suggestion"}
  ],
  "bestPractices": ["Practice 1", "Practice 2"],
  "securityConcerns": ["Concern 1"]
}
Respond ONLY with the JSON object.`;

export const getRegexGeneratorPrompt = (description: string, testCases: string) => `
Generate a Regular Expression for:

Requirement: ${description}
Test Cases to Match: ${testCases}

Generate regex in the following JSON format:
{
  "pattern": "The regex pattern",
  "explanation": "Breakdown of how it works",
  "examples": [
    {"match": "string1", "shouldMatch": true}
  ]
}
Respond ONLY with the JSON object. Escaped backslashes properly.`;

export const getSqlGeneratorPrompt = (naturalQuery: string, dialect: string) => `
Generate a SQL query for:

Requirement: ${naturalQuery}
Dialect: ${dialect}

Generate SQL in the following JSON format:
{
  "query": "SELECT * FROM ...",
  "explanation": "Explanation of the query logic",
  "dialect": "${dialect}"
}
Respond ONLY with the JSON object.`;

export const getUnitTestPrompt = (code: string, framework: string) => `
Generate unit tests for:

Code:
${code}

Framework: ${framework}

Generate tests in the following JSON format:
{
  "code": "Full unit test code...",
  "framework": "${framework}",
  "coverage": "What scenarios are covered"
}
Respond ONLY with the JSON object.`;

export const getJsonFormatterPrompt = (jsonString: string) => `
Validate and format the following JSON:

Input: ${jsonString}

Generate result in the following JSON format:
{
  "formattedJson": "Pretty printed JSON string",
  "isValid": true,
  "errors": []
}
Respond ONLY with the JSON object.`;

export const getCodeConverterPrompt = (code: string, sourceLang: string, targetLang: string) => `
Convert code from ${sourceLang} to ${targetLang}:

Code:
${code}

Generate result in the following JSON format:
{
  "sourceLanguage": "${sourceLang}",
  "targetLanguage": "${targetLang}",
  "convertedCode": "The converted code...",
  "notes": "Implementation notes or caveats"
}
Respond ONLY with the JSON object.`;

export const getResumeOptimizerPrompt = (resumeText: string, targetRole: string) => `
Optimize the following resume for a ${targetRole} position:

Resume Content:
${resumeText}

Generate optimization in the following JSON format:
{
  "score": 75,
  "strengths": ["Strength 1"],
  "weaknesses": ["Weakness 1"],
  "suggestions": [
    {"section": "Experience", "advice": "Use stronger verbs", "example": "Changed 'Did x' to 'Spearheaded x'"}
  ]
}
Respond ONLY with the JSON object.`;

export const getEmailDrafterPrompt = (purpose: string, audience: string, keyPoints: string) => `
Draft an email:

Purpose: ${purpose}
Audience: ${audience}
Key Points: ${keyPoints}

Generate draft in the following JSON format:
{
  "subject": "Compelling subject line",
  "body": "The email body...",
  "tone": "Professional/Casual",
  "audience": "${audience}"
}
Respond ONLY with the JSON object.`;

export const getSocialMediaPostPrompt = (topic: string, platform: string) => `
Create a social media post:

Topic: ${topic}
Platform: ${platform}

Generate post in the following JSON format:
{
  "platform": "${platform}",
  "content": "The post content...",
  "hashtags": ["#tag1", "#tag2"],
  "mediaSuggestion": "Description of image/video to attach"
}
Respond ONLY with the JSON object.`;

export const getSeoAnalyzerPrompt = (content: string, targetKeyword: string) => `
Analyze content for SEO:

Target Keyword: ${targetKeyword}
Content Sample: ${content}

Generate analysis in the following JSON format:
{
  "keyword": "${targetKeyword}",
  "score": 85,
  "titleCheck": "Title optimization feedback",
  "metaDescriptionCheck": "Meta description feedback",
  "contentSuggestions": ["Suggestion 1", "Suggestion 2"]
}
Respond ONLY with the JSON object.`;

export const getMeetingSummarizerPrompt = (transcript: string) => `
Summarize this meeting transcript:

Transcript:
${transcript}

Generate summary in the following JSON format:
{
  "title": "Meeting Title",
  "attendees": ["Person 1", "Person 2"],
  "keyPoints": ["Point 1", "Point 2"],
  "actionItems": [
    {"owner": "Person 1", "task": "Do X", "due": "Date"}
  ],
  "decisions": ["Decision 1"]
}
Respond ONLY with the JSON object.`;

export const getTranslatorPrompt = (text: string, sourceLang: string, targetLang: string) => `
Translate from ${sourceLang} to ${targetLang}:

Text: ${text}

Generate translation in the following JSON format:
{
  "sourceLanguage": "${sourceLang}",
  "targetLanguage": "${targetLang}",
  "originalText": "${text}",
  "translatedText": "Translated text...",
  "culturalNotes": "Any context or nuance notes"
}
Respond ONLY with the JSON object.`;

export const getJobDescriptionPrompt = (title: string, companyContext: string) => `
Create a job description:

Role: ${title}
Company Context: ${companyContext}

Generate JD in the following JSON format:
{
  "roleTitle": "${title}",
  "responsibilities": ["Resp 1", "Resp 2"],
  "requirements": ["Req 1", "Req 2"],
  "benefits": ["Benefit 1", "Benefit 2"]
}
Respond ONLY with the JSON object.`;

export const getPaletteGeneratorPrompt = (mood: string, baseColor: string) => `
Generate a color palette:

Mood: ${mood}
Base Color: ${baseColor}

Generate palette in the following JSON format:
{
  "mood": "${mood}",
  "colors": [
    {"hex": "#xxxxxx", "name": "Color Name", "usage": "Primary/Accent/Background"}
  ]
}
Respond ONLY with the JSON object.`;

export const getLegalContractReviewPrompt = (contractText: string, focus: string) => `
Review this contract text for risks (Disclaimer: AI analysis only):

Text: ${contractText}
Focus: ${focus}

Generate review in the following JSON format:
{
  "riskScore": 50,
  "summary": "Contract summary",
  "redFlags": [
    {"clause": "Clause text", "concern": "Why it is risky", "severity": "high"}
  ],
  "missingClauses": ["Standard clause missing"]
}
Respond ONLY with the JSON object.`;

export const getSwotAnalysisPrompt = (subject: string, context: string) => `
Perform SWOT analysis for:

Subject: ${subject}
Context: ${context}

Generate SWOT in the following JSON format:
{
  "strengths": ["S1", "S2"],
  "weaknesses": ["W1", "W2"],
  "opportunities": ["O1", "O2"],
  "threats": ["T1", "T2"],
  "strategy": "Strategic recommendation"
}
Respond ONLY with the JSON object.`;

export const getBusinessModelCanvasPrompt = (businessIdea: string) => `
Create a Business Model Canvas for:

Idea: ${businessIdea}

Generate BMC in the following JSON format:
{
  "keyPartners": ["Partner 1"],
  "keyActivities": ["Activity 1"],
  "valuePropositions": ["Value 1"],
  "customerRelationships": ["Rel 1"],
  "customerSegments": ["Seg 1"],
  "keyResources": ["Res 1"],
  "channels": ["Channel 1"],
  "costStructure": ["Cost 1"],
  "revenueStreams": ["Rev 1"]
}
Respond ONLY with the JSON object.`;

export const getInterviewPrepPrompt = (role: string, level: string) => `
Generate interview questions for:

Role: ${role}
Level: ${level}

Generate prep in the following JSON format:
{
  "role": "${role}",
  "questions": [
    {"question": "The question", "idealAnswerKeyPoints": ["Point 1", "Point 2"], "difficulty": "Medium"}
  ]
}
Respond ONLY with the JSON object.`;

export const getRecipeGeneratorPrompt = (ingredients: string, constraints: string) => `
Create a recipe using:

Ingredients: ${ingredients}
Constraints: ${constraints}

Generate recipe in the following JSON format:
{
  "name": "Recipe Name",
  "ingredients": [{"item": "Item", "amount": "Qty"}],
  "steps": ["Step 1", "Step 2"],
  "prepTime": "30 mins",
  "calories": "500 kcal",
  "dietaryTags": ["Vegetarian", "GF"]
}
Respond ONLY with the JSON object.`;

export const getWorkoutPlannerPrompt = (goal: string, equipment: string) => `
Create a workout plan:

Goal: ${goal}
Available Equipment: ${equipment}

Generate plan in the following JSON format:
{
  "goal": "${goal}",
  "duration": "4 weeks",
  "schedule": [
    {"day": "Monday", "workout": "Upper Body", "exercises": [{"name": "Pushups", "sets": "3", "reps": "12"}]}
  ]
}
Respond ONLY with the JSON object.`;

export const getTravelPlannerPrompt = (destination: string, days: string, budget: string) => `
Create a travel itinerary:

Destination: ${destination}
Duration: ${days} days
Budget: ${budget}

Generate itinerary in the following JSON format:
{
  "destination": "${destination}",
  "duration": "${days} days",
  "budgetEstimate": "${budget}",
  "days": [
    {"day": 1, "activities": [{"time": "Morning", "activity": "Visit X", "location": "City Center"}]}
  ]
}
Respond ONLY with the JSON object.`;

export const getGiftSuggesterPrompt = (recipientDesc: string, budget: string) => `
Suggest gifts for:

Recipient: ${recipientDesc}
Budget: ${budget}

Generate suggestions in the following JSON format:
{
  "recipient": "Short summary",
  "occasion": "General/Holiday",
  "ideas": [
    {"item": "Item Name", "priceRange": "$50-100", "reasoning": "Why they would like it"}
  ]
}
Respond ONLY with the JSON object.`;

export const getSloganGeneratorPrompt = (brandName: string, keywords: string) => `
Generate slogans for:

Brand: ${brandName}
Keywords: ${keywords}

Generate slogans in the following JSON format:
{
  "brandName": "${brandName}",
  "slogans": [
    {"text": "The slogan text", "vibe": "Modern/Classic"}
  ]
}
Respond ONLY with the JSON object.`;

export const getDomainNamerPrompt = (keywords: string, tldes: string) => `
Generate domain name ideas:

Keywords: ${keywords}
Preferred TLDs: ${tldes}

Generate domains in the following JSON format:
{
  "keywords": "${keywords}",
  "domains": [
    {"name": "example.com", "available": true, "priceEstimate": "$10"}
  ]
}
Respond ONLY with the JSON object.`;

export const getEli5Prompt = (topic: string, complexity: string) => `
Explain Like I'm 5:

Topic: ${topic}
Target Complexity: ${complexity}

Generate explanation in the following JSON format:
{
  "topic": "${topic}",
  "explanation": "Simple explanation...",
  "analogy": "It's like when..."
}
Respond ONLY with the JSON object.`;

export const getSentimentAnalyzerPrompt = (text: string) => `
Analyze sentiment of:

Text: ${text}

Generate analysis in the following JSON format:
{
  "text": "Truncated text...",
  "sentiment": "positive/negative/neutral",
  "score": 0.8,
  "emotions": [{"name": "Joy", "score": 0.8}]
}
Respond ONLY with the JSON object.`;

export const getCitationGeneratorPrompt = (sourceUrl: string, format: string) => `
Generate citation for:

Source: ${sourceUrl}
Format: ${format}

Generate citation in the following JSON format:
{
  "source": "${sourceUrl}",
  "format": "${format}",
  "citation": "Formatted citation string..."
}
Respond ONLY with the JSON object.`;

export const getStoryPlotGeneratorPrompt = (genre: string, theme: string) => `
Generate a story plot:

Genre: ${genre}
Theme: ${theme}

Generate plot in the following JSON format:
{
  "genre": "${genre}",
  "logline": "One sentence summary",
  "characters": [
    {"name": "Hero", "archetype": "Protagonist", "description": "Character details"}
  ],
  "acts": [
    {"title": "Act 1", "summary": "Summary of act 1"}
  ]
}
Respond ONLY with the JSON object.`;
