import React from 'react';
import { clsx } from 'clsx';

type PageWidth = 'narrow' | 'default' | 'wide';

const widthClasses: Record<PageWidth, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
};

interface PageShellProps {
  width?: PageWidth;
  children: React.ReactNode;
  className?: string;
  as?: 'main' | 'div';
}

export const PageShell: React.FC<PageShellProps> = ({
  width = 'default',
  children,
  className,
  as: Tag = 'main',
}) => (
  <Tag className={clsx(widthClasses[width], 'mx-auto py-12 px-8', className)}>
    {children}
  </Tag>
);

export const SHELL_NAV = 'max-w-6xl';
export const SHELL_WIDE = 'max-w-7xl';
