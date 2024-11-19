import { validateEmail, validatePhoneNumber, validateTeamMember } from '../../utils/validators';
import { TeamMemberFormData } from '../../types/teamMember';

describe('Validators', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('test.name@example.co.uk')).toBe(true);
      expect(validateEmail('test+label@example.com')).toBe(true);
    });

    it('should invalidate incorrect email formats', () => {
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test@example')).toBe(false);
      expect(validateEmail('test.example.com')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate correct phone number formats', () => {
      expect(validatePhoneNumber('1234567890')).toBe(true);
      expect(validatePhoneNumber('+1-234-567-8900')).toBe(true);
      expect(validatePhoneNumber('(123)456-7890')).toBe(false);
    });

    it('should invalidate incorrect phone number formats', () => {
      expect(validatePhoneNumber('123')).toBe(false);
      expect(validatePhoneNumber('abcdefghij')).toBe(false);
    });
  });

  describe('validateTeamMember', () => {
    const validMember: TeamMemberFormData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone_number: '1234567890',
      role: 'regular'
    };

    it('should return no errors for valid data', () => {
      expect(validateTeamMember(validMember)).toHaveLength(0);
    });

    it('should return errors for invalid data', () => {
      const invalidMember = {
        ...validMember,
        email: 'invalid-email',
        phone_number: '123'
      };
      const errors = validateTeamMember(invalidMember);
      expect(errors).toHaveLength(2);
      expect(errors.map(e => e.field)).toContain('email');
      expect(errors.map(e => e.field)).toContain('phone_number');
    });
  });
});