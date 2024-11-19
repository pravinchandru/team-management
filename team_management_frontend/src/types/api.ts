import { TeamMember } from './teamMember';

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  messages: {
    [key: string]: string[];
    general?: string[];
  };
}

// Update the teamMemberApi type definitions
export interface TeamMemberApi {
  getAll(): Promise<ApiResponse<TeamMember[]>>;
  getById(id: number): Promise<ApiResponse<TeamMember>>;
  create(data: Omit<TeamMember, 'id'>): Promise<ApiResponse<TeamMember>>;
  update(id: number, data: Omit<TeamMember, 'id'>): Promise<ApiResponse<TeamMember>>;
  delete(id: number): Promise<void>;
}