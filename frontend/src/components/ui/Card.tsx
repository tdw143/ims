// src/components/ui/Card.tsx
import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  elevation?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  elevation = 'md',
  bordered = false,
  hoverable = false,
}) => {
  const paddingStyles = clsx({
    'p-2': padding === 'sm',
    'p-4': padding === 'md',
    'p-6': padding === 'lg',
    'p-0': padding === 'none',
  });

  const elevationStyles = clsx({
    'shadow-sm': elevation === 'sm',
    'shadow-md': elevation === 'md',
    'shadow-lg': elevation === 'lg',
  });

  const baseStyles = clsx(
    'rounded-xl bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300',
    paddingStyles,
    elevationStyles,
    bordered && 'border border-gray-200 dark:border-gray-700',
    hoverable && 'hover:shadow-lg dark:hover:shadow-gray-700/20 transform hover:-translate-y-1',
    className
  );

  return <div className={baseStyles}>{children}</div>;
};

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
    {actions && <div>{actions}</div>}
  </div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={clsx('space-y-4', className)}>{children}</div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={clsx('pt-4 flex justify-end space-x-2', className)}>{children}</div>
);