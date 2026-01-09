/**
 * Agent Pipeline Router
 * Routes each service to its specialized multi-agent pipeline
 */

import type { ModelKey } from './ai';

// =============================================================================
// TYPES
// =============================================================================

export interface PipelineNode {
    id: string;
    title: string;
    emoji: string;
    model: ModelKey;
    promptTemplate: (userRequest: string, previousOutputs?: Record<string, string>) => string;
}

export interface ServicePipeline {
    service: ModelKey;
    nodes: PipelineNode[];
}

// =============================================================================
// SERVICE-SPECIFIC PIPELINES
// =============================================================================

/**
 * 🌐 Web Development Pipeline (5 nodes)
 * Tech-focused, code-quality oriented
 */
const WEB_DEV_PIPELINE: ServicePipeline = {
    service: 'coder',
    nodes: [
        {
            id: 'requirements',
            title: 'REQUIREMENTS ANALYSIS',
            emoji: '🔍',
            model: 'planner',
            promptTemplate: (userRequest) => `[WEB DEVELOPMENT - REQUIREMENTS PHASE]

User Request: "${userRequest}"

Analyze this web development request and provide:
1. **Core Requirements**: What needs to be built?
2. **Technical Specifications**: Frontend/Backend/Database needs
3. **User Stories**: Key features from user perspective
4. **Success Criteria**: How to measure completion
5. **Technology Stack Recommendations**: Best tools for the job

Be specific and technical. Focus on what, not how.`,
        },
        {
            id: 'architecture',
            title: 'ARCHITECTURE DESIGN',
            emoji: '🏗️',
            model: 'analyst',
            promptTemplate: (userRequest, prev) => `[WEB DEVELOPMENT - ARCHITECTURE PHASE]

Requirements Analysis:
${prev?.requirements || ''}

Original Request: "${userRequest}"

Design the system architecture:
1. **System Architecture**: Component breakdown, data flow
2. **Frontend Architecture**: Components, state management, routing
3. **Backend Architecture**: API structure, services, middleware
4. **Database Schema**: Tables/collections, relationships
5. **Security Considerations**: Authentication, authorization, data protection

Provide detailed architecture decisions with reasoning.`,
        },
        {
            id: 'implementation',
            title: 'CODE IMPLEMENTATION',
            emoji: '💻',
            model: 'coder',
            promptTemplate: (userRequest, prev) => `[WEB DEVELOPMENT - IMPLEMENTATION PHASE]

Requirements:
${prev?.requirements || ''}

Architecture:
${prev?.architecture || ''}

Original Request: "${userRequest}"

Generate production-ready code:
1. **Complete Implementation**: All files and components
2. **Best Practices**: Clean code, proper structure
3. **Documentation**: Comments and usage instructions
4. **Error Handling**: Robust error management
5. **TypeScript**: Type-safe implementation where applicable

Deliver high-quality, deployable code.`,
        },
        {
            id: 'security',
            title: 'SECURITY & CODE REVIEW',
            emoji: '🛡️',
            model: 'analyst',
            promptTemplate: (userRequest, prev) => `[WEB DEVELOPMENT - SECURITY AUDIT PHASE]

Generated Code:
${prev?.implementation || ''}

Perform comprehensive security and quality review:
1. **Security Vulnerabilities**: XSS, CSRF, SQL injection, etc.
2. **Code Quality**: Anti-patterns, performance issues
3. **Best Practices Compliance**: Framework conventions
4. **Accessibility**: A11y standards
5. **Critical Issues**: Must-fix before deployment

Rate overall quality (0-10) and list specific improvements.`,
        },
        {
            id: 'optimization',
            title: 'OPTIMIZATION & REFINEMENT',
            emoji: '⚡',
            model: 'coder',
            promptTemplate: (userRequest, prev) => `[WEB DEVELOPMENT - OPTIMIZATION PHASE]

Original Code:
${prev?.implementation || ''}

Security Review:
${prev?.security || ''}

Apply optimizations and fixes:
1. **Fix Security Issues**: Address vulnerabilities
2. **Performance Optimization**: Bundle size, lazy loading
3. **Code Refinement**: Better patterns, cleaner structure
4. **Production Readiness**: Environment configs, deployment notes

Deliver final, production-ready optimized code.`,
        },
    ],
};

/**
 * 🏗️ 3D & Architecture Visualization Pipeline (5 nodes)
 * Creative-focused, visual quality oriented
 */
const ARCH_VIZ_PIPELINE: ServicePipeline = {
    service: 'flux',
    nodes: [
        {
            id: 'concept',
            title: 'CONCEPT RESEARCH',
            emoji: '🔍',
            model: 'planner',
            promptTemplate: (userRequest) => `[3D ARCHITECTURE - CONCEPT PHASE]

User Request: "${userRequest}"

Research and analyze the visual concept:
1. **Style Analysis**: Architectural style, era, influences
2. **Mood & Atmosphere**: Lighting, time of day, weather
3. **Key Visual Elements**: Materials, textures, focal points
4. **Reference Context**: Similar projects, inspiration
5. **Technical Requirements**: Resolution, format, angles

Provide detailed visual concept brief.`,
        },
        {
            id: 'creative',
            title: 'CREATIVE BRIEF',
            emoji: '🎨',
            model: 'marketing',
            promptTemplate: (userRequest, prev) => `[3D ARCHITECTURE - CREATIVE BRIEF PHASE]

Concept Research:
${prev?.concept || ''}

Original Request: "${userRequest}"

Develop creative storytelling brief:
1. **Visual Narrative**: Story the image tells
2. **Composition Strategy**: Rule of thirds, leading lines
3. **Color Palette**: Warm/cool, complementary schemes
4. **Emotional Impact**: Desired viewer response
5. **Brand Alignment**: How it represents the project

Create compelling creative direction.`,
        },
        {
            id: 'scene',
            title: 'SCENE PLANNING',
            emoji: '🧠',
            model: 'analyst',
            promptTemplate: (userRequest, prev) => `[3D ARCHITECTURE - SCENE PLANNING PHASE]

Concept:
${prev?.concept || ''}

Creative Brief:
${prev?.creative || ''}

Plan the 3D scene in detail:
1. **Camera Setup**: Angle, focal length, perspective
2. **Lighting Design**: Key, fill, rim lights, HDRI
3. **Material Specifications**: Textures, reflections, roughness
4. **Scene Composition**: Object placement, hierarchy
5. **Rendering Settings**: Quality, samples, post-processing

Provide technical rendering blueprint.`,
        },
        {
            id: 'generation',
            title: 'VISUAL GENERATION',
            emoji: '🖼️',
            model: 'flux',
            promptTemplate: (userRequest, prev) => `[3D ARCHITECTURE - GENERATION PHASE]

Scene Plan:
${prev?.scene || ''}

${userRequest}

Photorealistic architectural visualization with professional lighting and materials.`,
        },
        {
            id: 'review',
            title: 'QUALITY REVIEW',
            emoji: '⚖️',
            model: 'analyst',
            promptTemplate: (userRequest, prev) => `[3D ARCHITECTURE - REVIEW PHASE]

Original Request: "${userRequest}"

Review the visualization approach:
1. **Concept Alignment**: Matches original vision?
2. **Technical Quality**: Lighting, materials, composition
3. **Professional Standards**: Industry-level quality?
4. **Improvements**: Suggested enhancements
5. **Variations**: Alternative angles or settings

Provide professional critique and recommendations.`,
        },
    ],
};

/**
 * 🤖 AI Automation Pipeline (5 nodes)
 * Process-focused, integration oriented
 */
const AUTOMATION_PIPELINE: ServicePipeline = {
    service: 'agentic',
    nodes: [
        {
            id: 'process',
            title: 'PROCESS ANALYSIS',
            emoji: '🔍',
            model: 'planner',
            promptTemplate: (userRequest) => `[AI AUTOMATION - PROCESS ANALYSIS PHASE]

User Request: "${userRequest}"

Analyze the automation need:
1. **Current Process**: Manual workflow to automate
2. **Pain Points**: Inefficiencies to eliminate
3. **Automation Opportunities**: What can be automated
4. **Integration Points**: Systems to connect
5. **Success Metrics**: ROI, time saved, efficiency gains

Map out the process comprehensively.`,
        },
        {
            id: 'logic',
            title: 'AUTOMATION LOGIC DESIGN',
            emoji: '🧠',
            model: 'analyst',
            promptTemplate: (userRequest, prev) => `[AI AUTOMATION - LOGIC DESIGN PHASE]

Process Analysis:
${prev?.process || ''}

Original Request: "${userRequest}"

Design the automation logic:
1. **Decision Trees**: If/then logic flows
2. **Trigger Events**: What starts the automation
3. **Data Transformations**: Input → Processing → Output
4. **Error Scenarios**: Fallback behaviors
5. **Human Handoffs**: When to escalate to humans

Create comprehensive automation blueprint.`,
        },
        {
            id: 'development',
            title: 'BOT DEVELOPMENT',
            emoji: '🤖',
            model: 'agentic',
            promptTemplate: (userRequest, prev) => `[AI AUTOMATION - DEVELOPMENT PHASE]

Process Map:
${prev?.process || ''}

Logic Design:
${prev?.logic || ''}

Original Request: "${userRequest}"

Develop the automation:
1. **Bot Implementation**: Complete code
2. **Command Handlers**: User interactions
3. **API Integrations**: External services
4. **State Management**: Session and data handling
5. **Deployment Instructions**: How to run

Build production-ready automation.`,
        },
        {
            id: 'testing',
            title: 'TESTING SCENARIOS',
            emoji: '🧪',
            model: 'analyst',
            promptTemplate: (userRequest, prev) => `[AI AUTOMATION - TESTING PHASE]

Bot Code:
${prev?.development || ''}

Create comprehensive test plan:
1. **Happy Path Tests**: Normal operations
2. **Edge Cases**: Unusual inputs
3. **Error Handling**: Failure scenarios
4. **Load Testing**: Performance under stress
5. **Security Testing**: Authorization, data protection

Define thorough testing strategy.`,
        },
        {
            id: 'integration',
            title: 'INTEGRATION GUIDE',
            emoji: '📋',
            model: 'coder',
            promptTemplate: (userRequest, prev) => `[AI AUTOMATION - INTEGRATION PHASE]

Bot Implementation:
${prev?.development || ''}

Testing Plan:
${prev?.testing || ''}

Create deployment guide:
1. **Setup Instructions**: Step-by-step deployment
2. **Configuration**: Environment variables, API keys
3. **Integration Steps**: Connect to systems
4. **Monitoring**: Logging and analytics
5. **Maintenance**: Updates and troubleshooting

Provide complete deployment documentation.`,
        },
    ],
};

/**
 * 📈 G-Nexus Platform / Marketing Pipeline (5 nodes)
 * Strategy-focused, ROI oriented
 */
const MARKETING_PIPELINE: ServicePipeline = {
    service: 'marketing',
    nodes: [
        {
            id: 'research',
            title: 'MARKET RESEARCH',
            emoji: '🔍',
            model: 'planner',
            promptTemplate: (userRequest) => `[MARKETING - MARKET RESEARCH PHASE]

User Request: "${userRequest}"

Conduct market analysis:
1. **Target Audience**: Demographics, psychographics, behaviors
2. **Market Size**: TAM, SAM, SOM estimates
3. **Competitive Landscape**: Key players, positioning
4. **Market Trends**: Opportunities and threats
5. **Customer Pain Points**: Problems to solve

Deliver comprehensive market intelligence.`,
        },
        {
            id: 'strategy',
            title: 'BRAND STRATEGY',
            emoji: '🧠',
            model: 'analyst',
            promptTemplate: (userRequest, prev) => `[MARKETING - BRAND STRATEGY PHASE]

Market Research:
${prev?.research || ''}

Original Request: "${userRequest}"

Develop brand strategy:
1. **Positioning**: Unique value proposition
2. **Messaging Framework**: Key messages, tone
3. **Differentiation**: What makes it unique
4. **Brand Personality**: Voice, values, attributes
5. **Go-to-Market**: Launch strategy

Create strategic brand blueprint.`,
        },
        {
            id: 'content',
            title: 'CONTENT CREATION',
            emoji: '✍️',
            model: 'marketing',
            promptTemplate: (userRequest, prev) => `[MARKETING - CONTENT CREATION PHASE]

Market Research:
${prev?.research || ''}

Brand Strategy:
${prev?.strategy || ''}

Original Request: "${userRequest}"

Create marketing content:
1. **Headlines & Copy**: Compelling messaging
2. **Call-to-Actions**: Conversion-focused CTAs
3. **Value Propositions**: Clear benefits
4. **Social Media Content**: Posts, captions
5. **Email Sequences**: Nurture campaigns

Deliver persuasive, conversion-optimized content.`,
        },
        {
            id: 'campaign',
            title: 'CAMPAIGN DESIGN',
            emoji: '📊',
            model: 'marketing',
            promptTemplate: (userRequest, prev) => `[MARKETING - CAMPAIGN DESIGN PHASE]

Strategy:
${prev?.strategy || ''}

Content:
${prev?.content || ''}

Design multi-channel campaign:
1. **Channel Mix**: Social, email, ads, content
2. **Content Calendar**: When to post what
3. **Budget Allocation**: Spend distribution
4. **Funnel Strategy**: Awareness → Conversion
5. **Creative Assets**: What needs to be created

Build comprehensive campaign plan.`,
        },
        {
            id: 'metrics',
            title: 'PERFORMANCE METRICS',
            emoji: '📈',
            model: 'analyst',
            promptTemplate: (userRequest, prev) => `[MARKETING - METRICS PHASE]

Campaign Plan:
${prev?.campaign || ''}

Define success metrics:
1. **KPIs**: Key performance indicators
2. **Targets**: Specific goals and benchmarks
3. **ROI Projections**: Expected returns
4. **Attribution Model**: How to track conversions
5. **Reporting Dashboard**: What to monitor

Establish data-driven measurement framework.`,
        },
    ],
};

// =============================================================================
// PIPELINE ROUTER
// =============================================================================

export const SERVICE_PIPELINES: Record<string, ServicePipeline> = {
    coder: WEB_DEV_PIPELINE,
    flux: ARCH_VIZ_PIPELINE,
    agentic: AUTOMATION_PIPELINE,
    marketing: MARKETING_PIPELINE,
};

/**
 * Get the pipeline configuration for a service
 */
export function getPipelineForService(service: ModelKey): ServicePipeline | null {
    return SERVICE_PIPELINES[service] || null;
}

/**
 * Check if a service has a custom pipeline
 */
export function hasCustomPipeline(service: ModelKey): boolean {
    return service in SERVICE_PIPELINES;
}
