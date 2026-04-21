import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => (
  <button
    className={`px-4 py-2 rounded font-bold ${
      variant === 'primary'
        ? 'bg-blue-600 text-white'
        : variant === 'secondary'
        ? 'bg-gray-300 text-black'
        : 'bg-red-600 text-white'
    }`}
    {...props}
  >
    {children}
  </button>
);

export default Button;