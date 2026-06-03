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

export type CombinationType = 'signature' | 'hidden' | 'tension' | 'sleeper';

export interface TalentCombination {
  type: CombinationType;
  name: string;
  talents: string[];
  mechanism: string;
  atItsBest: string;
  whenItBackfires: string;
  rarity: string;
}

export interface LesserTalent {
  name: string;        // CliftonStrengths theme name
  risk: string;        // where this lesser theme can get in the way
  manage: string;      // how to manage it via your dominant strengths (partner / delegate / system / compensate)
}

export interface LesserTalents {
  summary: string;        // what the bottom reveals ("who you are not") + how it shapes the top 5
  themes: LesserTalent[]; // the bottom 5 lesser themes
  forTopTalents: string;  // how managing the bottom protects & amplifies the top talents
}

export interface AnalysisResult {
  combinations: TalentCombination[];
  talentDNA: string;
  dominantDomain: Domain;
  domainReason: string;
  strengthsInteraction: string;
  superpower: string;
  blindSpots: string[];
  famousPeople: FamousPerson[];
  careers: Career[];
  idealPartners: IdealPartner[];
  lesserTalents?: LesserTalents;   // only when a full-34 report provided the bottom themes
  share_token?: string;
}

export interface AnalyzeRequest {
  strengths: string[];
}

export type TaskCategory = 'awareness' | 'practice' | 'challenge' | 'mastery';

export interface PlanTask {
  id: number;
  dayRange: string;        // "Day 1–2"
  title: string;
  hook: string;            // One arresting narrative sentence
  description: string;
  action: string;
  strengthsUsed: string[];
  reflection: string;
  unlockKey: string;       // e.g. "DEEP_FOCUS"
  duration: string;        // e.g. "20 min"
  category: TaskCategory;
}

export interface PlanResult {
  programTitle: string;
  programDescription: string;
  tasks: PlanTask[];
}
