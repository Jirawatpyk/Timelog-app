/**
 * SearchResultsCount Component - Story 5.7
 *
 * Displays the number of search results found.
 * Includes search query for context.
 */

'use client';

import { motion } from 'framer-motion';

interface SearchResultsCountProps {
  count: number;
  query: string;
}

export function SearchResultsCount({ count, query }: SearchResultsCountProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-sm text-muted-foreground"
    >
      Found{' '}
      <motion.span
        key={count}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-medium text-foreground"
      >
        {count}
      </motion.span>{' '}
      {count === 1 ? 'entry' : 'entries'}
      {query && (
        <span className="ml-1">
          for &quot;<span className="font-medium">{query}</span>&quot;
        </span>
      )}
    </motion.div>
  );
}
