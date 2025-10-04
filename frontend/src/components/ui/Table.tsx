// src/components/ui/Table.tsx
import React from 'react';
import clsx from 'clsx';

interface TableProps {
  children: React.ReactNode;
  className?: string;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
}

export const Table: React.FC<TableProps> = ({
  children,
  className,
  striped = false,
  bordered = false,
  hoverable = false,
}) => {
  const baseStyles = clsx(
    'min-w-full divide-y',
    bordered && 'border border-gray-200 dark:border-gray-700',
    className
  );

  return (
    <table className={baseStyles}>
      {children}
    </table>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-gray-50 dark:bg-gray-800">
    {children}
  </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
    {children}
  </tbody>
);

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  striped?: boolean;
  index?: number;
  hoverable?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  striped = false,
  index,
  hoverable = false,
  className,
  ...props
}) => {
  const rowStyles = clsx(
    'transition-colors',
    (striped && index !== undefined && index % 2 === 0) &&
      'bg-gray-50 dark:bg-gray-700/50',
    hoverable && 'hover:bg-gray-100 dark:hover:bg-gray-700',
    className
  );

  return (
    <tr className={rowStyles} {...props}>
      {children}
    </tr>
  );
};

interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  header?: boolean;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  header = false,
  className,
  align = 'left',
  ...props
}) => {
  const Component = header ? 'th' : 'td';
  const cellStyles = clsx(
    'px-4 py-3 text-sm',
    {
      'text-left': align === 'left',
      'text-center': align === 'center',
      'text-right': align === 'right',
    },
    header && 'font-semibold text-gray-700 dark:text-gray-300',
    !header && 'text-gray-600 dark:text-gray-400',
    className
  );

  return (
    <Component className={cellStyles} {...props}>
      {children}
    </Component>
  );
};