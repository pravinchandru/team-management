export interface TeamMember {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  role: 'regular' | 'admin';
}

export interface ResponseData {
  data: TeamMember[]
}

export interface GetResponseData {
  data: TeamMember
}

export type TeamMemberFormData = Omit<TeamMember, 'id'>;
export type Page = 'list' | 'add' | 'edit';