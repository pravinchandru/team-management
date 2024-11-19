// src/components/MemberForm/MemberForm.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { TeamMemberFormData, Page } from '../../types/teamMember';
import { teamMemberApi } from '../../services/api';
import { ROLES, ROLE_LABELS } from '../../utils/constants';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

interface MemberFormProps {
  mode: 'add' | 'edit';
  id?: number | null;
  onNavigate: (page: Page, id?: number | null) => void;
}

interface FormErrors {
  [key: string]: string[] | undefined;
  general?: string[];
}

export const MemberForm: React.FC<MemberFormProps> = ({ mode, id, onNavigate }) => {
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<TeamMemberFormData>({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    role: ROLES.REGULAR
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      const loadMember = async () => {
        try {
          setIsLoading(true);
          setErrors({});
          const formData = await teamMemberApi.getById(id);
          const memberData = formData.data
          setFormData({
            first_name: memberData.first_name,
            last_name: memberData.last_name,
            phone_number: memberData.phone_number,
            email: memberData.email,
            role: memberData.role
          });
        } catch (err) {
          setErrors({ general: ['Failed to load member data'] });
        } finally {
          setIsLoading(false);
        }
      };

      loadMember();
    }
  }, [mode, id]);

  const getFieldError = (fieldName: string): string | undefined => {
    return errors[fieldName]?.join(' ');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSaving(true);

    try {
      if (mode === 'add') {
        await teamMemberApi.create(formData);
      } else if (mode === 'edit' && id) {
        await teamMemberApi.update(id, formData);
      }
      onNavigate('list');
    } catch (error: any) {
      console.log('Error response:', error);
      if (error.messages) {
        setErrors(error.messages);
        if (!error.messages.general) {
          setErrors(prev => ({
            ...prev,
            general: ['Failed to save member data']
          }));
        }
      } else {
        setErrors({ general: ['Failed to save member data'] });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this team member?')) {
      setIsLoading(true);
      setErrors({});
      try {
        await teamMemberApi.delete(id);
        onNavigate('list');
      } catch (err) {
        setErrors({ general: ['Failed to delete member'] });
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    onNavigate('list');
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-2xl mx-auto flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center mb-4">
        <button
          onClick={handleBack}
          className="mr-4"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">
          {mode === 'add' ? 'Add' : 'Edit'} Team Member
        </h1>
      </div>

      {errors.general && (
        <div 
          className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded" 
          role="alert"
        >
          {errors.general.join(' ')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="first_name" className="block text-gray-700">
            First Name
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            value={formData.first_name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              getFieldError('first_name') 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            required
            aria-required="true"
            disabled={isSaving}
          />
          {getFieldError('first_name') && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {getFieldError('first_name')}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="last_name" className="block text-gray-700">
            Last Name
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            value={formData.last_name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              getFieldError('last_name') 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            required
            aria-required="true"
            disabled={isSaving}
          />
          {getFieldError('last_name') && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {getFieldError('last_name')}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              getFieldError('email') 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            required
            aria-required="true"
            disabled={isSaving}
          />
          {getFieldError('email') && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {getFieldError('email')}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone_number" className="block text-gray-700">
            Phone Number
          </label>
          <input
            id="phone_number"
            name="phone_number"
            type="tel"
            value={formData.phone_number}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              getFieldError('phone_number') 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            required
            aria-required="true"
            disabled={isSaving}
          />
          {getFieldError('phone_number') && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {getFieldError('phone_number')}
            </p>
          )}
        </div>

        <fieldset className="space-y-4">
          <legend className="block text-gray-700 mb-2 font-medium">Role</legend>
          <div className="space-y-2 bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={ROLES.REGULAR}
                    checked={formData.role === ROLES.REGULAR}
                    onChange={handleChange}
                    className="form-radio text-blue-500 focus:ring-blue-500 h-4 w-4"
                    disabled={isSaving}
                  />
                  <span className="ml-2 text-gray-700 font-medium">
                    {ROLE_LABELS[ROLES.REGULAR]}
                  </span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={ROLES.ADMIN}
                    checked={formData.role === ROLES.ADMIN}
                    onChange={handleChange}
                    className="form-radio text-blue-500 focus:ring-blue-500 h-4 w-4"
                    disabled={isSaving}
                  />
                  <span className="ml-2 text-gray-700 font-medium">
                    {ROLE_LABELS[ROLES.ADMIN]}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </fieldset>

        <div className="flex justify-between pt-4">
          {mode === 'edit' && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
              disabled={isSaving}
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center"
            disabled={isSaving}
          >
            {isSaving && <div className="mr-2"><LoadingSpinner /></div>}
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;