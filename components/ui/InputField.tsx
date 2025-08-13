import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-300">{label}</label>
      <input
        id={id}
        {...props}
        aria-required={props.required}
        className="bg-gray-700/50 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 transition"
      />
    </div>
  );
};

export default InputField;