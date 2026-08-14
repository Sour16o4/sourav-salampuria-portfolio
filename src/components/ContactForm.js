'use client';

import { useEffect, useState } from 'react';

import Reveal from '@/components/Reveal';
import site from '@/content/site.json';
import { Stops } from '@/lib/stops';
import { Todo, isTodo } from '@/lib/todo';

/**
 * Posts to `contact.endpoint`, which is this site's own `/api/contact` route.
 *
 * The markup carries a real `action` and `method`, so the form submits and the
 * route redirects back with the outcome even with JS disabled. When JS is
 * available the submit is intercepted and answered inline instead, which is the
 * only difference between the two paths.
 *
 * With no endpoint configured at all it falls back to composing a mail draft —
 * which works with no service and stores nothing, but cannot tell the visitor
 * whether anything was received.
 */
export default function ContactForm({ contact }) {
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  // `idle` | `sending` | `sent` | the error string to show.
  const [state, setState] = useState('idle');

  // No endpoint at all, or a placeholder that is not one yet — either way the
  // mail draft is the behaviour. The TODO marker is rendered separately, so
  // clearing it does not silently turn the form into a POST to nowhere.
  const noEndpoint = !contact.endpoint || isTodo(contact.endpoint);

  // The no-JS path lands back here with the outcome in the query string. Read
  // it once, then strip it so a reload does not re-announce a stale result.
  useEffect(() => {
    const sent = new URLSearchParams(window.location.search).get('sent');
    if (sent !== 'ok' && sent !== 'error') return;
    setState(sent === 'ok' ? 'sent' : 'Something went wrong. Try email instead.');
    const url = new URL(window.location.href);
    url.searchParams.delete('sent');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }, []);

  const update = (key) => (event) =>
    setValues((previous) => ({ ...previous, [key]: event.target.value }));

  const onSubmit = async (event) => {
    if (noEndpoint) {
      event.preventDefault();
      const address = [site.email.user, site.email.domain].join(String.fromCharCode(64));
      const subject = encodeURIComponent(`Portfolio enquiry — ${values.name || 'no name'}`);
      const body = encodeURIComponent(
        `${values.message}\n\n—\n${values.name}\n${values.email}`
      );
      window.location.href = `mailto:${address}?subject=${subject}&body=${body}`;
      return;
    }

    event.preventDefault();
    setState('sending');
    try {
      const response = await fetch(contact.endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState(data.error || 'Something went wrong. Try email instead.');
        return;
      }
      setValues({ name: '', email: '', message: '' });
      setState('sent');
    } catch {
      // Offline, blocked, or the route is unreachable. Never leave the button
      // spinning — say so and let them fall back to email.
      setState('Could not reach the server. Try email instead.');
    }
  };

  const sending = state === 'sending';
  const sent = state === 'sent';
  const error = state !== 'idle' && !sending && !sent ? state : null;

  return (
    <section id="contact" className="hairline section-y" aria-labelledby="contact-heading">
      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-20">
        <Reveal as="div" stagger>
          <p className="micro">{contact.label}</p>
          <h2 id="contact-heading" className="t-h2 mt-5">
            <Stops text={contact.heading} />
          </h2>
          <p className="t-body mt-6 max-w-[42ch]">{contact.lead}</p>
        </Reveal>

        <div>
          <form
            onSubmit={onSubmit}
            action={noEndpoint ? undefined : contact.endpoint}
            method={noEndpoint ? undefined : 'post'}
            className="grid gap-4"
          >
            <div>
              <label htmlFor="cf-name" className="micro mb-2 block">
                {contact.fields.name}
              </label>
              <input
                id="cf-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={values.name}
                onChange={update('name')}
                className="field"
              />
            </div>

            <div>
              <label htmlFor="cf-email" className="micro mb-2 block">
                {contact.fields.email}
              </label>
              <input
                id="cf-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={values.email}
                onChange={update('email')}
                className="field"
              />
            </div>

            <div>
              <label htmlFor="cf-message" className="micro mb-2 block">
                {contact.fields.message}
              </label>
              <textarea
                id="cf-message"
                name="message"
                required
                rows={5}
                value={values.message}
                onChange={update('message')}
                className="field resize-y"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" className="btn btn-primary" disabled={sending || sent}>
                {sending ? 'Sending…' : sent ? 'Sent' : contact.submit}
              </button>

              {/* Announced politely so a screen reader hears the outcome without
                  losing the caret. The palette is one accent and a grey ramp —
                  there is no red to reach for, so the wording carries the
                  meaning and full-strength ink carries the emphasis. */}
              <p aria-live="polite" className="mono m-0 text-[13px]">
                {sent ? (
                  <span className="text-acc">Thanks — that reached my inbox.</span>
                ) : error ? (
                  <span className="text-ink">{error}</span>
                ) : null}
              </p>
            </div>
          </form>

          {isTodo(contact.endpoint) ? (
            <div className="mt-6">
              <Todo value={contact.endpoint} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
