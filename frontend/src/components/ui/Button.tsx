// src/components/ui/Button.tsx
import React from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  className,
  ...props
}) => {
  const baseStyles = clsx(
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    fullWidth && 'w-full',
    isLoading && 'opacity-70 cursor-wait',
    className
  );

  const variantStyles = clsx({
    // 主按钮 - 渐变背景
    'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500 shadow-md hover:shadow-lg':
      variant === 'primary',
    // 次要按钮
    'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 focus:ring-gray-500':
      variant === 'secondary',
    // 危险按钮
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500':
      variant === 'destructive',
    // 幽灵按钮
    'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500':
      variant === 'ghost',
  });

  const sizeStyles = clsx({
    'px-3 py-1.5 text-sm': size === 'sm',
    'px-4 py-2 text-base': size === 'md',
    'px-6 py-3 text-lg': size === 'lg',
  });

  return (
    <button
      className={clsx(baseStyles, variantStyles, sizeStyles)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};