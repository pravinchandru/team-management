export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}