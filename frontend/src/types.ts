export interface Layer {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  features: string[];
  technologies: string[];
}

export interface TechStackItem {
  category: string;
  name: string;
  reason: string;
}

export interface Improvement {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

export interface CostEstimate {
  tier: string;
  monthlyMin: number;
  monthlyMax: number;
  notes: string;
}

export interface Risk {
  severity: 'high' | 'medium' | 'low';
  title: string;
  mitigation: string;
}

export interface Architecture {
  title: string;
  summary: string;
  projectType: string;
  scale: string;
  version: number;
  layers: Layer[];
  techStack: TechStackItem[];
  improvements: Improvement[];
  costEstimate: CostEstimate;
  risks: Risk[];
}

export interface GeneratePayload {
  idea: string;
  projectType: string;
  scale: string;
  pastFeedbacks?: string[];
}

export interface RefinePayload {
  existingArch: Architecture;
  feedback: string;
  pastFeedbacks?: string[];
}

export interface HistoryEntry {
  id: string;
  title: string;
  projectType: string;
  scale: string;
  createdAt: string;
  arch: Architecture;
}

export type ProjectType =
  | 'SaaS Web App'
  | 'Mobile App'
  | 'API / Backend Service'
  | 'E-commerce'
  | 'Data Pipeline'
  | 'AI / ML System'
  | 'Real-time App'
  | 'Microservices'
  | 'Monolith';

export type Scale =
  | 'MVP / Prototype'
  | 'Small (< 1K users)'
  | 'Medium (1K–100K users)'
  | 'Large (100K–1M users)'
  | 'Enterprise (1M+ users)';
