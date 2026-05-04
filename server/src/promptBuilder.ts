import { ArchitectureJSON, Layer } from './types';

const LAYER_ICONS: Record<string, string> = {
  frontend: '🖥️',
  backend: '⚙️',
  database: '🗄️',
  auth: '🔐',
  cache: '⚡',
  storage: '📦',
  api: '🔌',
  queue: '📨',
  search: '🔍',
  monitoring: '📊',
  cdn: '🌐',
  mobile: '📱',
  ai: '🤖',
  security: '🛡️',
  devops: '🚀',
};

const LAYER_COLORS: Record<string, string> = {
  frontend: '#6366f1',
  backend: '#8b5cf6',
  database: '#06b6d4',
  auth: '#f59e0b',
  cache: '#10b981',
  storage: '#f97316',
  api: '#ec4899',
  queue: '#14b8a6',
  search: '#84cc16',
  monitoring: '#fb7185',
  cdn: '#38bdf8',
  mobile: '#a78bfa',
  ai: '#fb923c',
  security: '#facc15',
  devops: '#4ade80',
};

export function buildSystemPrompt(pastFeedbacks: string[] = []): string {
  const lessonsLearned =
    pastFeedbacks.length > 0
      ? `\n\nLESSONS FROM USER FEEDBACK (apply these):\n${pastFeedbacks
          .slice(-8)
          .map((f, i) => `${i + 1}. ${f}`)
          .join('\n')}`
      : '';

  return `You are an expert software architect. When given a project idea, project type, and scale, you output a comprehensive, structured software architecture in strict JSON format.

OUTPUT RULES:
- Return ONLY valid JSON, no markdown, no code blocks, no explanation
- Every field in the schema is REQUIRED
- Layer ids must be lowercase snake_case
- Icon must be one of: frontend, backend, database, auth, cache, storage, api, queue, search, monitoring, cdn, mobile, ai, security, devops
- Cost estimates must use real-world SaaS pricing (AWS, Vercel, Supabase, etc.)
- Generate 4-8 layers depending on project complexity
- Generate 5-10 tech stack entries
- Generate 3-5 improvements
- Generate 3-5 risks

JSON SCHEMA:
{
  "title": "string — concise project name",
  "summary": "string — 2-sentence architecture overview",
  "projectType": "string — echo back the input",
  "scale": "string — echo back the input",
  "version": 1,
  "layers": [
    {
      "id": "string",
      "name": "string — human-readable layer name",
      "icon": "string — one of the allowed keys above",
      "color": "string — hex color",
      "description": "string — what this layer does",
      "features": ["string — specific feature or responsibility"],
      "technologies": ["string — specific technology/library/service"]
    }
  ],
  "techStack": [
    {
      "category": "string",
      "name": "string",
      "reason": "string — why this choice fits"
    }
  ],
  "improvements": [
    {
      "priority": "high|medium|low",
      "title": "string",
      "description": "string"
    }
  ],
  "costEstimate": {
    "tier": "string — e.g. Startup, Growth, Enterprise",
    "monthlyMin": number,
    "monthlyMax": number,
    "notes": "string — key cost drivers"
  },
  "risks": [
    {
      "severity": "high|medium|low",
      "title": "string",
      "mitigation": "string"
    }
  ]
}
${lessonsLearned}`;
}

export function buildRefinePrompt(feedback: string, version: number): string {
  return `The user has reviewed the architecture and provided this feedback:

"${feedback}"

Update the architecture to address this feedback. Increment the version to ${version + 1}.
Return ONLY the complete updated JSON — same schema, no markdown, no explanation.
Every field must be present. Do not omit any section.`;
}

export function assignLayerColors(arch: ArchitectureJSON): ArchitectureJSON {
  return {
    ...arch,
    layers: arch.layers.map((layer: Layer) => ({
      ...layer,
      color: LAYER_COLORS[layer.icon] || '#6366f1',
      icon: LAYER_ICONS[layer.icon] || '🔧',
    })),
  };
}
