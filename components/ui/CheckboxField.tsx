import React from 'react';

interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ id, label, ...props }) => {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        {...props}
        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
      />
      <label htmlFor={id} className="ms-2 text-sm font-medium text-gray-300">{label}</label>
    </div>
  );
};

export default CheckboxField;