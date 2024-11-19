// src/App.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { TeamMemberList } from './components/TeamMemberList';
import { MemberForm } from './components/MemberForm';
import { Page } from './types/teamMember';
import { setDocumentTitle } from './utils/document';


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('list');
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    switch (currentPage) {
      case 'list':
        setDocumentTitle('Team Members');
        break;
      case 'add':
        setDocumentTitle('Add Team Member');
        break;
      case 'edit':
        setDocumentTitle('Edit Team Member');
        break;
    }
  }, [currentPage]);

  const navigate = useCallback((page: Page, id: number | null = null) => {
    setCurrentPage(page);
    setSelectedMemberId(id);
    if (page === 'list') {
      // Increment refresh key to force TeamMemberList to remount
      setRefreshKey(prev => prev + 1);
    }
  }, []);

 return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'list' && (
        <TeamMemberList 
          key={refreshKey} 
          onNavigate={navigate} 
        />
      )}
      {currentPage === 'add' && (
        <MemberForm 
          mode="add" 
          onNavigate={navigate} 
        />
      )}
      {currentPage === 'edit' && (
        <MemberForm 
          mode="edit" 
          id={selectedMemberId} 
          onNavigate={navigate} 
        />
      )}
    </div>
  );
};

export default App;