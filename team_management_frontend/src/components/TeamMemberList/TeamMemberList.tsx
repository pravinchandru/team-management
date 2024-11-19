// src/components/TeamMemberList/TeamMemberList.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { TeamMember, Page } from '../../types/teamMember';
import { teamMemberApi } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

interface TeamMemberListProps {
  onNavigate: (page: Page, id?: number | null) => void;
}

export const TeamMemberList: React.FC<TeamMemberListProps> = ({ onNavigate }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await teamMemberApi.getAll();
      if (Array.isArray(response.data)) {
        setMembers(response.data);
      } else {
        setMembers([]);
      }
    } catch (err) {
      setError('Failed to load team members');
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();

    // Only add focus event listener if not navigating between pages
    const handleFocus = () => {
      if (!isNavigating) {
        fetchMembers();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isNavigating]);

  const handleAddClick = () => {
    setIsNavigating(true);
    onNavigate('add');
  };

  const handleMemberClick = (memberId: number) => {
    setIsNavigating(true);
    onNavigate('edit', memberId);
  };

  const handleDelete = async (e: React.MouseEvent, memberId: number) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await teamMemberApi.delete(memberId);
        await fetchMembers();
      } catch (err) {
        setError('Failed to delete team member');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex justify-center items-center h-48">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-gray-600" aria-live="polite">
            {members.length} team members
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
          aria-label="Add team member"
        >
          <Plus size={24} />
        </button>
      </div>

      {error && (
        <div 
          className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded" 
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      <div className="space-y-2" role="list" aria-label="Team members list">
        {members.map((member) => (
          <div
            key={member.id}
            onClick={() => handleMemberClick(member.id)}
            className="p-4 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50 relative transition-all duration-200"
            role="button"
            tabIndex={0}
            aria-label={`Edit ${member.first_name} ${member.last_name}`}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMemberClick(member.id);
              }
            }}
          >
            <div className="flex justify-between items-center">
              <div className="flex-grow">
                <h2 className="text-lg font-semibold">
                  {member.first_name} {member.last_name}
                  {member.role === 'admin' && (
                    <span className="ml-2 text-sm text-gray-500" aria-label="Administrator">
                      (Admin)
                    </span>
                  )}
                </h2>
                <p className="text-gray-600">
                  <span className="sr-only">Email:</span> {member.email}
                </p>
                <p className="text-gray-600">
                  <span className="sr-only">Phone:</span> {member.phone_number}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(e, member.id)}
                className="p-2 ml-4 text-red-500 rounded-full hover:text-red-600 hover:bg-red-100 transition-all duration-200 
                           hover:shadow-lg hover:shadow-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label={`Delete ${member.first_name} ${member.last_name}`}
              >
                <Trash2 
                  size={20}
                  className="transform hover:scale-110 transition-transform duration-200"
                />
              </button>
            </div>
          </div>
        ))}
        {members.length === 0 && !error && (
          <p className="text-gray-500 text-center py-8">
            No team members found. Click the plus button to add one.
          </p>
        )}
      </div>

      {/*{error && (
        <div 
          className="fixed bottom-4 right-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded shadow-lg" 
          role="alert"
        >
          {error}
        </div>
      )}*/}
    </div>
  );
};

export default TeamMemberList;