import React, { useState, useId } from 'react';

interface AccordionProps {
  title: string;
  count: number;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, count, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-gray-700/50 hover:bg-gray-700/80 rounded-lg transition-colors"
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="font-semibold text-lg text-yellow-200/90">
          {title} ({count})
        </span>
        <svg
          className={`w-6 h-6 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div id={contentId} hidden={!isOpen}>
        <div className="p-4 bg-gray-900/40 rounded-b-lg border border-t-0 border-gray-700 space-y-4 animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;