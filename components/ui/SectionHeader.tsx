import React from 'react';

const SectionHeader: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="flex justify-between items-center border-b-2 border-yellow-500/30 pb-2 mb-4">
      <h2 className="text-2xl font-semibold text-yellow-200/90">{title}</h2>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
};

export default SectionHeader;
