export enum ReportType {
  MORNING = 'MORNING',
  EVENING = 'EVENING'
}

export interface ReportConfig {
  isActive: boolean;
  morningTime: string;
  eveningTime: string;
  email: string;
}

export interface ReportData {
  id: string;
  type: ReportType;
  dateStr: string; // "YYYY-MM-DD"
  timestamp: number;
  content: string;
  groundingUrls: Array<{ title: string; url: string }>;
  status: 'generating' | 'completed' | 'failed';
}