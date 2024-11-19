import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div
      className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;