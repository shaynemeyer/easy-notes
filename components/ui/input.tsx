import React from 'react';

interface InputProps {
  label: string;
  error?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name: string;
  placeholder?: string;
  disabled?: boolean;
}

export function Input({
  label,
  error,
  type = 'text',
  value,
  onChange,
  onFocus,
  name,
  placeholder,
  disabled = false,
}: InputProps) {
  return (
    <div className='space-y-2'>
      <label htmlFor={name} className='block text-sm font-medium text-zinc-900 dark:text-zinc-100'>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100 ${
          error ? 'border-red-500 dark:border-red-500' : 'border-zinc-300 dark:border-zinc-700'
        }`}
      />
      {error && <p className='text-sm text-red-500'>{error}</p>}
    </div>
  );
}
