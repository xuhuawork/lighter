export interface Lighter {
  number: number;
  usageCount: number;
  history: Array<{
    date: Date;
    location: string;
    story: string;
  }>;
} 