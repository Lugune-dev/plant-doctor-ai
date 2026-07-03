export type Language = "sw" | "en";
export type Theme = "light" | "dark";

export interface User {
  id: string;
  email: string;
  fullName: string;
  location: string;
  createdAt: string;
  token?: string;
}

export interface TreatmentInfo {
  immediateActions: string[];
  organicRemedies: string[];
  chemicalOptions: string[];
  preventiveMeasures: string[];
}

export interface DiagnosisResult {
  plantType: string;
  diseaseName: string;
  confidence: number;
  severity: string;
  description: string;
  symptoms: string[];
  treatment: TreatmentInfo;
}

export interface ScanRecord {
  id: string;
  userId: string;
  imageUrl: string; // Base64 representation for local display & storage
  diagnosis: DiagnosisResult;
  timestamp: string;
  farmerNotes?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface WeatherInfo {
  temp: number;
  condition: string;
  conditionCode: "sunny" | "cloudy" | "rainy" | "windy";
  humidity: number;
  precipitationChance: number;
  recommendation: string;
  recommendationSw: string;
}
