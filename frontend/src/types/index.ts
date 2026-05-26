export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface Session {
  id: string;
  status: 'discovery' | 'extracting' | 'ready' | 'complete';
  industry: string;
  created_at: string;
  business_context?: BusinessContext;
}

export interface BusinessContext {
  company_name?: string;
  industry: string;
  business_model?: string;
  channels: string[];
  customer_types: string[];
  entities: string[];
  has_loyalty: boolean;
  loyalty_details?: Record<string, unknown>;
  marketing_channels: string[];
  transaction_types: string[];
  digital_experiences: string[];
  data_goals: string[];
}

export interface XDMField {
  type: string;
  required: boolean;
  description: string;
  identity?: boolean;
  identityNamespace?: string;
}

export interface XDMSchema {
  schemaName: string;
  xdmClass: string;
  description: string;
  profileEnabled: boolean;
  fields: Record<string, XDMField>;
  requiredFields: string[];
  identityFields: string[];
  fieldGroups: string[];
  ingestionRecommendation: {
    sources: string[];
    methods: string[];
    frequency: string;
  };
  profileEnablementReason: string;
}

export interface Relationship {
  from: string;
  to: string;
  type: string;
  description: string;
}

export interface XDMDesign {
  schemas: XDMSchema[];
  relationships: Relationship[];
  identityStrategy: {
    primary: string[];
    secondary: string[];
    device: string[];
    description: string;
  };
  datasets: Array<{
    name: string;
    schema: string;
    profile_enabled: boolean;
    ingestion: string[];
    methods: string[];
  }>;
  totalSchemas: number;
}

export interface EntityModel {
  entities: Array<{
    entity: string;
    description: string;
    xdmClass: string;
    profileEnabled: boolean;
    keyFields: string[];
    identityFields: string[];
  }>;
  totalEntities: number;
  profileEntities: number;
  eventEntities: number;
}

export interface BusinessSummary {
  companyName: string;
  industry: string;
  overview: string;
  keyEntities: string[];
  channels: string[];
  marketingChannels: string[];
  hasLoyaltyProgram: boolean;
  recommendedSchemaCount: number;
  dataGoals: string[];
  executiveSummary: string;
}

export interface QualityScore {
  overall: number;
  breakdown: {
    identityCompleteness: number;
    duplicationRisk: number;
    profileReadiness: number;
    personalizationReadiness: number;
    activationReadiness: number;
  };
  recommendations: string[];
}

export interface XDMOutput {
  session_id: string;
  business_summary: BusinessSummary;
  entity_model: EntityModel;
  xdm_design: XDMDesign;
  json_export: Record<string, unknown>;
  architecture_diagram: string;
  quality_score: QualityScore;
  generated_at: string;
}

export interface ChatResponse {
  session_id: string;
  message: string;
  session_status: Session['status'];
  is_discovery_complete: boolean;
  business_context?: BusinessContext;
}

export interface XDMGenerateRequest {
  session_id: string;
}
