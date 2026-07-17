import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'custom';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
  style
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-md';
  
  const variants = {
    primary: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    secondary: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    danger: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    custom: '',
  };

  return (
    <span
      style={style}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
