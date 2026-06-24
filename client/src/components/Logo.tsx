import React, { useId } from 'react';
import { Link } from 'react-router-dom';

type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  linkToHome?: boolean;
  className?: string;
}

const LOGO_VIEWBOX = { width: 108, height: 150 };

const sizeClasses: Record<LogoSize, { mark: string; text: string }> = {
  sm: { mark: 'h-8', text: 'text-base' },
  md: { mark: 'h-10', text: 'text-lg' },
  lg: { mark: 'h-16', text: 'text-2xl' },
};

/** 内联 SVG + 蒙版，fill 使用 currentColor 与网站字体一致 */
const LogoMark: React.FC<{ className?: string }> = ({ className = '' }) => {
  const maskId = useId();

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${LOGO_VIEWBOX.width} ${LOGO_VIEWBOX.height}`}
      className={`shrink-0 text-gray-900 ${className}`}
      style={{ aspectRatio: `${LOGO_VIEWBOX.width} / ${LOGO_VIEWBOX.height}` }}
      fill="currentColor"
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="108" height="150">
          <image href="/logo.png" width="108" height="150" preserveAspectRatio="xMidYMid meet" />
        </mask>
      </defs>
      <rect width="108" height="150" mask={`url(#${maskId})`} fill="currentColor" />
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  linkToHome = false,
  className = '',
}) => {
  const { mark, text } = sizeClasses[size];

  const content = (
    <span className={`inline-flex items-center gap-3 text-gray-900 ${className}`}>
      <LogoMark className={`${mark} w-auto`} />
      {showText ? (
        <span className={`${text} font-light tracking-tight`}>
          圣经阅读
        </span>
      ) : (
        <span className="sr-only">圣经阅读排行榜</span>
      )}
    </span>
  );

  if (linkToHome) {
    return (
      <Link to="/" className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};
