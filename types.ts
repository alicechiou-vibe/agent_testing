export enum ReportType {
  MORNING = 'MORNING',
  EVENING = 'EVENING'
}

export interface ReportConfig {
  morningTime: string; // Format "HH:mm" e.g., "08:00"
  eveningTime: string; // Format "HH:mm" e.g., "22:00"
  email: string;
  isActive: boolean;
}

export interface ReportData {
  id: string;
  type: ReportType;
  timestamp: number;
  content: string;
  groundingUrls: Array<{ title: string; url: string }>;
  status: 'generating' | 'completed' | 'failed' | 'sent';
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'error';
}