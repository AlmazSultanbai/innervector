export type Domain = 'Executing' | 'Influencing' | 'Relationship Building' | 'Strategic Thinking';

export interface StrengthMeta {
  name: string;
  domain: Domain;
}

export interface FamousPerson {
  name: string;
  field: string;
  whyMatch: string;
  achievement: string;
}

export interface Career {
  title: string;
  whyFits: string;
  firstStep: string;
}

export interface AnalysisResult {
  talentDNA: string;
  dominantDomain: Domain;
  domainReason: string;
  strengthsInteraction: string;
  superpower: string;
  blindSpots: string[];
  famousPeople: FamousPerson[];
  careers: Career[];
}

export interface AnalyzeRequest {
  strengths: string[];
}
