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

export interface IdealPartner {
  type: string;           // e.g. "The Analytical Strategist"
  topStrengths: string[]; // 2-3 CliftonStrengths that define them
  whyComplement: string;  // Why this pairing works
  dynamicInAction: string; // One concrete example of this duo in real work
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
  idealPartners: IdealPartner[];
}

export interface AnalyzeRequest {
  strengths: string[];
}
