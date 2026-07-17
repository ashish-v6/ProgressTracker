import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'glass-light' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'glass',
  padding = 'md',
  ...props
}) => {
  const baseStyles = 'rounded-lg overflow-hidden transition-all duration-200';
  
  const variants = {
    glass: 'glass-panel shadow-sm',
    'glass-light': 'glass-panel-light shadow-sm',
    interactive: 'glass-panel-interactive shadow-sm',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`border-b border-white/5 pb-4 mb-4 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`border-t border-white/5 pt-4 mt-4 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
