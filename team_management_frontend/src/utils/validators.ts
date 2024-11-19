import { ValidationError } from '../types/error';
import { TeamMemberFormData } from '../types/teamMember';

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const re = /^\+?[\d\s-]{10,}$/;
  return re.test(phone);
};

export const validateTeamMember = (values: TeamMemberFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!values.first_name.trim()) {
    errors.push({ field: 'first_name', message: 'First name is required' });
  }

  if (!values.last_name.trim()) {
    errors.push({ field: 'last_name', message: 'Last name is required' });
  }

  if (!validateEmail(values.email)) {
    errors.push({ field: 'email', message: 'Invalid email address' });
  }

  if (!validatePhoneNumber(values.phone_number)) {
    errors.push({ field: 'phone_number', message: 'Invalid phone number' });
  }

  return errors;
};