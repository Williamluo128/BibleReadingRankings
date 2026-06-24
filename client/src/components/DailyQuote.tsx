import React, { useMemo } from 'react';
import { getDailyQuote, getDailyQuoteLabel } from '@/utils/daily-quote';

export const DailyQuote: React.FC = () => {
  const quote = useMemo(() => getDailyQuote(), []);

  return (
    <blockquote className="mt-10 pt-8 border-t border-border-warm">
      <p className="text-label mb-4">{getDailyQuoteLabel(quote.kind)}</p>
      <p
        className={
          quote.kind === 'scripture'
            ? 'bible-text text-ink mb-4'
            : 'text-lg text-ink font-light leading-relaxed mb-4'
        }
      >
        「{quote.text}」
      </p>
      <footer className="text-sm text-muted">— {quote.reference}</footer>
    </blockquote>
  );
};
