'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'icon';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  children,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 shadow-lg shadow-blue-600/20',
    ghost: 'bg-transparent hover:bg-white/5 text-gray-300 px-4 py-2',
    icon: 'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white p-2',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
