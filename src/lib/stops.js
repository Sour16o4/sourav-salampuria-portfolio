import { Fragment } from 'react';

/**
 * The site's signature tic: section headings end in a full stop, and the full
 * stop is green.
 *
 * Handles mid-string periods too — "Build. Then verify." gets both, which is
 * why this splits rather than using a ::after pseudo-element.
 */
export function Stops({ text }) {
  const source = String(text ?? '');
  if (!source.includes('.')) return source;

  const parts = source.split('.');
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 ? <span className="text-acc">.</span> : null}
        </Fragment>
      ))}
    </>
  );
}
