import React from 'react';

export function Input({ 
  label, 
  error, 
  icon: Icon,
  className = '', 
  containerClassName = '',
  ...props 
}) {
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          className={`
            w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5
            bg-white border-2 border-gray-200 rounded-xl
            text-gray-900 placeholder-gray-400
            focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10
            hover:border-gray-300
            transition-all duration-200
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

export function Select({ 
  label, 
  error, 
  options = [],
  placeholder = 'Select an option',
  icon: Icon,
  className = '', 
  containerClassName = '',
  ...props 
}) {
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <select
          className={`
            w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-2.5
            bg-white border-2 border-gray-200 rounded-xl
            text-gray-900 
            focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10
            hover:border-gray-300
            appearance-none cursor-pointer
            transition-all duration-200
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
            ${className}
          `}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

export function Textarea({ 
  label, 
  error, 
  className = '', 
  containerClassName = '',
  ...props 
}) {
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-2.5
          bg-white border-2 border-gray-200 rounded-xl
          text-gray-900 placeholder-gray-400
          focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10
          hover:border-gray-300
          transition-all duration-200
          resize-y min-h-[100px]
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

export function Checkbox({ label, className = '', ...props }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        className={`
          w-5 h-5 
          text-purple-600 
          border-2 border-gray-300 rounded-md
          focus:ring-4 focus:ring-purple-500/20 
          hover:border-purple-400
          transition-all duration-200
          cursor-pointer
          ${className}
        `}
        {...props}
      />
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
    </label>
  );
}

export function Radio({ label, className = '', ...props }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="radio"
        className={`
          w-5 h-5 
          text-purple-600 
          border-2 border-gray-300
          focus:ring-4 focus:ring-purple-500/20 
          hover:border-purple-400
          transition-all duration-200
          cursor-pointer
          ${className}
        `}
        {...props}
      />
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
    </label>
  );
}
