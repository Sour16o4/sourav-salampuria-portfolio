/**
 * The master prompt forbids inventing metrics, dates, testimonials or
 * outcomes: "leave a clearly marked TODO rather than filling it in."
 *
 * Any content string beginning with "TODO:" renders as a loud amber-bordered
 * marker instead of prose, so an unfilled gap cannot be mistaken for finished
 * copy or shipped by accident. Amber is not a second accent colour — it never
 * appears in the finished site, because a finished site has no TODOs left.
 */
export function isTodo(value) {
  return typeof value === 'string' && value.trimStart().startsWith('TODO:');
}

/** Strip the marker prefix for display. */
export function todoText(value) {
  return String(value).trimStart().replace(/^TODO:\s*/, '');
}

export function Todo({ value, className = '' }) {
  return (
    <p
      className={`mono border-l-2 border-amber-500/60 bg-amber-500/5 px-4 py-3 text-[12px] leading-relaxed text-amber-200/80 ${className}`}
      data-todo=""
    >
      <span className="font-semibold tracking-[0.16em] text-amber-400">TODO </span>
      {todoText(value)}
    </p>
  );
}

/**
 * Renders `value` through `render` unless it is a TODO marker.
 * Keeps call sites from repeating the conditional.
 */
export function TodoOr({ value, children }) {
  if (isTodo(value)) return <Todo value={value} />;
  return children;
}
