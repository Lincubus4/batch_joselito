export interface ProcessedImage {
  id: string;
  originalFile: File;
  originalUrl: string;
  processedUrl: string | null;
  name: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  width: number;
  height: number;
}

export type FitMode = 'cover' | 'contain' | 'fill';

export interface DimensionSuggestion {
  width: number;
  height: number;
  reasoning: string;
}
