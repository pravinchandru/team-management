// src/services/api.ts
import { TeamMember, ResponseData, GetResponseData, TeamMemberFormData } from '../types/teamMember';

interface ApiError {
  status: number;
  messages: { [key: string]: string[] };
}

export const createApiClient = (baseUrl: string) => {
  const handleRequest = async <T>(
    url: string,
    options?: RequestInit
  ): Promise<T> => {
    try {
      console.log('Calling getAll API'); // Debug log
      const response = await fetch(`${baseUrl}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      console.log('API response:', response); // Debug log
      if (!response.ok) {
        const errorData = await response.json();
        throw {
          status: response.status,
          messages: errorData
        } as ApiError;
      }

      const data = await response.json();
      console.log('API data:', data); // Debug log
      return data;
    } catch (error) {
      if ((error as ApiError).messages) {
        throw error;
      }
      throw { status: 500, messages: { error: ['Failed to connect to server'] } };
    }
  };

  return {
    get: <T>(url: string) => handleRequest<T>(url),
    post: <T>(url: string, data: any) =>
      handleRequest<T>(url, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    put: <T>(url: string, data: any) =>
      handleRequest<T>(url, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (url: string) =>
      handleRequest(url, { method: 'DELETE' }),
  };
};

const api = createApiClient('/api');

export const teamMemberApi = {
  getAll: () => 
    api.get<ResponseData>('/team-members/'),

  getById: (id: number) => 
    api.get<GetResponseData>(`/team-members/${id}/`),

  create: (data: TeamMemberFormData) => 
    api.post<TeamMember>('/team-members/', data),

  update: (id: number, data: TeamMemberFormData) => 
    api.put<TeamMember>(`/team-members/${id}/`, data),

  delete: (id: number) => 
    api.delete(`/team-members/${id}/`),
};

export type ApiClient = ReturnType<typeof createApiClient>;
export default api;