/** Référentiel public d'une personne suivie par l'observatoire. */
export type Candidate = {
  id: string;
  name: string;
  party: string;
  politicalPosition: string;
  accent: string;
  portraitUrl?: string;
  portraitSource?: string;
  partyShortName?: string;
  partyLogoUrl?: string;
  partyLogoSource?: string;
};

/** Thème utilisé pour classer une proposition dans l'interface publique. */
export type Theme = {
  id: string;
  label: string;
};

/** Programme ou document de référence rattaché à un candidat. */
export type Program = {
  id: string;
  candidateId: string;
  title: string;
  url: string;
  publisher: string;
  sourceKind: "officielle" | "formation_politique" | "campagne";
  status: string;
  checkedAt: string;
  note: string;
};

/** Critère versionné utilisé pour calculer le score de robustesse d'un dossier. */
export type EvaluationBand = {
  min: number;
  max: number;
  label: string;
  anchor: string;
};

export type EvaluationCriterion = {
  id: string;
  label: string;
  weight: number;
  color: string;
  description: string;
  gridVersion: string;
  evidenceDimensions: string[];
  bands: EvaluationBand[];
};

export type ScoreUncertainty = {
  level: "faible" | "moyenne" | "forte";
  reasons: string[];
  interval?: { min: number; max: number };
};

export type EvaluationConfidence = {
  level: "faible" | "moyenne" | "forte";
  reasons: string[];
};

export type EvaluationCorpus = {
  id: string;
  version: string;
};

export type EvaluationPrompt = {
  id: string;
  version: string;
};

export type EvaluationReviewer = {
  id: string;
  role: string;
};

export type EvaluationAggregation = {
  method: "moyenne-ponderee";
  gridVersion: string;
  criterionCount: number;
  rounding: "nearest-integer";
};

export type EvaluationAbstention = {
  reason: string;
  missingInformation: string[];
  reconsiderationConditions: string[];
};

export type ProposalScore = {
  criterionId: string;
  value?: number;
  explanation: string;
  sourceIds: string[];
  /** Champ à renseigner pour toute nouvelle évaluation ; absent dans les notes historiques non recalculées. */
  band?: Pick<EvaluationBand, "min" | "max" | "label">;
  uncertainty?: ScoreUncertainty;
  observedFacts?: string[];
  missingInformation?: string[];
  abstention?: EvaluationAbstention;
};

/** Proposition publiée avec ses sources, analyses et critères de notation. */
export type Proposal = {
  id: string;
  candidateId: string;
  themeId: string;
  title: string;
  summary: string;
  publishedAt: string;
  dateKind?: "publication" | "observation";
  dateLabel?: string;
  status: string;
  confidence: string;
  attribution: {
    kind: "candidate" | "campaign" | "party" | "past_program";
    label: string;
  };
  sourceIds: string[];
  analysis: { gpt: string; claude: string };
  evaluation: {
    status: "provisoire" | "validée" | "abstention";
    methodologyVersion: string;
    evaluatedAt: string;
    /** Le score décrit le dossier de la proposition, pas sa valeur politique. */
    scoreLabel?: "robustesse-documentaire";
    gridVersion?: string;
    corpus?: EvaluationCorpus;
    prompt?: EvaluationPrompt;
    reviewer?: EvaluationReviewer;
    aggregation?: EvaluationAggregation;
    confidence?: EvaluationConfidence;
    uncertainty?: ScoreUncertainty;
    abstention?: EvaluationAbstention;
  };
  scores: ProposalScore[];
};

/** Source externe utilisée pour établir ou contextualiser une proposition. */
export type Source = {
  id: string;
  proposalIds: string[];
  kind: "primaire" | "secondaire" | "contextuelle";
  title: string;
  publisher: string;
  url: string;
  publishedAt?: string;
  accessedAt: string;
  excerpt?: string;
};

export type TrackRecord = {
  id: string;
  candidateId: string;
  themeId: string;
  kind: "vote" | "government_action" | "public_position" | "bill" | "past_program";
  title: string;
  summary: string;
  date: string;
  relationship: "context" | "continuity" | "evolution" | "tension" | "contradiction_confirmed";
  conclusion: string;
  relatedProposalIds: string[];
  sources: Array<{
    title: string;
    publisher: string;
    url: string;
    accessedAt: string;
    excerpt?: string;
  }>;
};
