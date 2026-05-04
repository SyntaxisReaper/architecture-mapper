export interface Layer {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  features: string[];
  technologies: string[];
}

export interface ArchitectureJSON {
  title: string;
  summary: string;
  projectType: string;
  scale: string;
  version: number;
  layers: Layer[];
  techStack: {
    category: string;
    name: string;
    reason: string;
  }[];
  improvements: {
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
  }[];
  costEstimate: {
    tier: string;
    monthlyMin: number;
    monthlyMax: number;
    notes: string;
  };
  risks: {
    severity: 'high' | 'medium' | 'low';
    title: string;
    mitigation: string;
  }[];
}

export interface GenerateRequest {
  idea: string;
  projectType: string;
  scale: string;
  userId?: string;
}

export interface RefineRequest {
  existingArch: ArchitectureJSON;
  feedback: string;
  userId?: string;
  pastFeedbacks?: string[];
}

export interface ApiError {
  error: string;
  code: string;
}
