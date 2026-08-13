import { Fragment } from 'react';

/**
 * Renders a content string where `backticked` runs become JetBrains Mono.
 *
 * This is how the sans/mono split gets enforced inside prose: file paths,
 * commands, and identifiers are marked up in the JSON, so the rule is applied
 * by the content rather than remembered at each call site.
 */
export function Rich({ text }) {
  const source = typeof text === 'string' ? text : '';
  if (!source.includes('`')) return source;

  const parts = source.split('`');
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} className="mono text-[0.94em]">
            {part}
          </span>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        )
      )}
    </>
  );
}

/** Same content, flattened to a plain string — for aria-label, title, meta. */
export function plain(text) {
  return typeof text === 'string' ? text.replace(/`/g, '') : '';
}
