export interface MedicalTestInput {
  glucose: number;
  urea: number;
  creatinine: number;
  hemoglobin: number;
  platelets: number;
  wbc: number;
  rbc: number;
  alt: number;
  ast: number;
  bilirubin: number;
  albumin: number;
  sodium: number;
  potassium: number;
  cholesterol: number;
  hdl: number;
  ldl: number;
  triglycerides: number;
}

export type RiskLevel = "Low" | "Moderate" | "High";

export interface DiseasePrediction {
  disease: string;
  riskLevel: RiskLevel;
  probability: number;
  description: string;
}

export interface SaltRecommendation {
  saltName: string;
  medicationName: string;
  safeStartingAge: number;
  dosage: string;
  cautions: string[];
  whenNeeded: string;
}

export interface DietPlan {
  foodsToEat: string[];
  foodsToAvoid: string[];
  healthyRoutines: string[];
  duration: string;
  mealPlan?: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
}

export interface RecoveryTimeline {
  estimatedDuration: string;
  milestones: { week: number; description: string }[];
  improvementPercentage: number;
}

export interface PredictionResult {
  predictions: DiseasePrediction[];
  saltRecommendations: SaltRecommendation[];
  dietPlan: DietPlan;
  recoveryTimeline: RecoveryTimeline;
  testDate: string;
  userId?: string;
}

export interface HealthHistory {
  id: string;
  testDate: string;
  predictions: DiseasePrediction[];
  testValues: MedicalTestInput;
  /** Full snapshot for PDF/history view */
  fullResult?: PredictionResult;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}
