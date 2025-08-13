import React from 'react';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ id, label, children, ...props }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-300">{label}</label>}
      <select
        id={id}
        {...props}
        className="bg-gray-700/50 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 transition"
      >
        {children}
      </select>
    </div>
  );
};

export default SelectField;