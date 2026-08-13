'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import site from '@/content/site.json';
import { prefersReducedMotion } from '@/lib/motion';

const CHAR_MS = 16;
const LINE_GAP_MS = 130;

/**
 * The hero terminal — and it is a real shell, not a picture of one.
 *
 * anime.js has exactly one job on this site and this is it: the intro
 * typewriter. Everything after that is React state.
 *
 * Two things protect the layout:
 *   · the intro is server-rendered as one span per character, so the panel is
 *     its natural size on first paint — with JS off or reduced motion on it
 *     simply reads as finished text;
 *   · the body is a fixed height with internal scroll, so command output can
 *     never grow the panel and push the page around. CLS stays at zero no
 *     matter how much a visitor types.
 */
export default function Terminal({ terminal }) {
  const shell = terminal.shell;
  const router = useRouter();

  const introRef = useRef(null);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const skipIntroRef = useRef(() => {});

  const [history, setHistory] = useState([]);
  const [value, setValue] = useState('');

  /* --- intro typewriter (anime.js) --------------------------------------
     The intro is server-rendered as plain text, and only split into
     per-character spans here, on the client, when the typewriter is actually
     going to run.

     Splitting in the markup instead cost ~250 extra nodes to serialise, ship,
     hydrate and lay out on every visit — including for the many visitors who
     never see the animation, since Lighthouse and anyone with reduced motion
     enabled skip it entirely. That was worth ~250ms of style-and-layout on a
     throttled phone. */
  useEffect(() => {
    const root = introRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;

    const lines = Array.from(root.querySelectorAll('[data-line]'));
    if (lines.length === 0) return undefined;

    const originals = lines.map((line) => line.textContent);
    const restore = () => {
      lines.forEach((line, index) => {
        line.textContent = originals[index];
      });
    };

    // Split now — layout is already settled, so this costs one reflow.
    const chars = [];
    for (const line of lines) {
      const text = line.textContent;
      line.textContent = '';
      const fragment = document.createDocumentFragment();
      for (const character of text) {
        const span = document.createElement('span');
        span.dataset.char = '';
        span.textContent = character;
        fragment.appendChild(span);
        chars.push({ el: span, line });
      }
      line.appendChild(fragment);
    }

    const showAll = () => {
      for (const { el } of chars) el.style.opacity = '1';
    };
    skipIntroRef.current = showAll;

    let animation = null;
    let cancelled = false;

    const delays = [];
    let clock = 0;
    let lastLine = chars[0]?.line;
    for (const char of chars) {
      if (char.line !== lastLine) {
        clock += LINE_GAP_MS;
        lastLine = char.line;
      }
      delays.push(clock);
      clock += CHAR_MS;
    }

    const elements = chars.map((c) => c.el);
    for (const el of elements) el.style.opacity = '0';

    import('animejs')
      .then(({ animate }) => {
        if (cancelled) {
          showAll();
          return;
        }
        animation = animate(elements, {
          opacity: [0, 1],
          duration: 1,
          ease: 'linear',
          delay: (_target, index) => delays[index],
        });
        skipIntroRef.current = () => {
          animation.cancel();
          showAll();
        };
      })
      .catch(showAll);

    return () => {
      cancelled = true;
      if (animation) animation.cancel();
      // Put the plain text back so a remount starts from a clean tree rather
      // than re-splitting spans that are already split.
      restore();
      skipIntroRef.current = () => {};
    };
  }, [terminal]);

  /* --- keep the newest output in view ----------------------------------- */
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [history]);

  const focusInput = useCallback(() => {
    skipIntroRef.current();
    inputRef.current?.focus();
  }, []);

  /* --- the shell -------------------------------------------------------- */
  const run = useCallback(
    (event) => {
      event.preventDefault();
      const raw = value.trim();
      setValue('');
      if (!raw) return;

      skipIntroRef.current();

      const [command, ...rest] = raw.split(/\s+/);
      const argument = rest.join(' ').toLowerCase();
      const key = command.toLowerCase();

      if (key === 'clear') {
        setHistory([]);
        return;
      }

      const email = [site.email.user, site.email.domain].join(String.fromCharCode(64));

      let output;
      if (key === 'skills' || raw.toLowerCase() === 'cat skills.txt') {
        output = [
          ...terminal.groups.map((group) => `${group.key.padEnd(12, ' ')}${group.value}`),
          '',
          terminal.comment,
        ];
      } else if (key === 'open') {
        const path = shell.routes[argument];
        if (path) {
          output = [shell.opening.replace('{path}', path)];
          setHistory((previous) => [...previous, { input: raw, output }]);
          router.push(path);
          return;
        }
        output = [
          `no such report: ${argument || '(nothing)'}`,
          `try: ${Object.keys(shell.routes).join(', ')}`,
        ];
      } else if (shell.commands[key]) {
        output = shell.commands[key].map((line) =>
          line.replace('{email}', email).replace('{github}', site.links.github)
        );
      } else {
        output = [shell.notFound.replace('{cmd}', command)];
      }

      setHistory((previous) => [...previous, { input: raw, output }]);
    },
    [value, terminal, shell, router]
  );

  /* --- intro markup: plain text, one element per line --------------------
     Per-character spans are created on the client only if the typewriter runs.
     This keeps the served HTML small and the panel correctly sized. */
  let lineIndex = 0;
  const line = (text, className = '') => (
    <span
      key={lineIndex++}
      data-line=""
      className={`block whitespace-pre-wrap ${className}`}
    >
      {text}
    </span>
  );

  return (
    <div className="terminal">
      <div className="flex items-center gap-2 border-b border-faint bg-bg-3 px-4 py-3">
        <span className="terminal-dot" aria-hidden="true" />
        <span className="terminal-dot" aria-hidden="true" />
        <span className="terminal-dot" aria-hidden="true" />
        <span className="mono ml-2 truncate text-[11px] text-mute">{terminal.title}</span>
      </div>

      {/* Fixed height + internal scroll: output can never resize the panel. */}
      <div
        ref={bodyRef}
        onClick={focusInput}
        className="mono h-[304px] overflow-y-auto px-4 py-5 text-[12.5px] leading-[1.75] sm:px-5 sm:text-[13px] lg:h-[336px]"
      >
        <div ref={introRef}>
          {line(terminal.command, 'text-ink')}
          {line(' ')}
          {terminal.groups.map((group) =>
            line(`${group.key.padEnd(12, ' ')}${group.value}`, 'text-mute')
          )}
          {line(' ')}
          {line(terminal.comment, 'text-acc')}
        </div>

        {/* Command output. Announced politely so a screen reader hears it. */}
        <div aria-live="polite" aria-atomic="false">
          {history.map((entry, index) => (
            <div key={index} className="mt-3">
              <span className="block whitespace-pre-wrap text-ink">
                <span className="text-acc">{shell.prompt} </span>
                {entry.input}
              </span>
              {entry.output.map((outputLine, position) => (
                <span key={position} className="block whitespace-pre-wrap text-mute">
                  {outputLine || ' '}
                </span>
              ))}
            </div>
          ))}
        </div>

        <form onSubmit={run} className="mt-3 flex items-baseline gap-2">
          <label htmlFor="terminal-input" className="sr-only">
            {shell.inputLabel}
          </label>
          <span aria-hidden="true" className="shrink-0 text-acc">
            {shell.prompt}
          </span>
          <input
            id="terminal-input"
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onFocus={() => skipIntroRef.current()}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            enterKeyHint="go"
            placeholder={shell.hint}
            className="mono min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] text-ink placeholder:text-mute/55 lg:text-[13px]"
          />
        </form>
      </div>
    </div>
  );
}
