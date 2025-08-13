import React from 'react';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ id, label, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-300">{label}</label>
      <textarea
        id={id}
        rows={3}
        {...props}
        className="bg-gray-700/50 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 transition"
      ></textarea>
    </div>
  );
};

export default TextAreaField;
