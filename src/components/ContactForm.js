'use client';

import { useState } from 'react';

import Reveal from '@/components/Reveal';
import site from '@/content/site.json';
import { Stops } from '@/lib/stops';
import { Todo, isTodo } from '@/lib/todo';

/**
 * No form backend is configured. Rather than pretend to submit, this composes
 * a mail draft from the fields — which works today, with no service, no
 * storage, and nothing to leak. Point `contact.endpoint` at a POST URL to
 * replace that behaviour.
 */
export default function ContactForm({ contact }) {
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const noEndpoint = isTodo(contact.endpoint);

  const update = (key) => (event) =>
    setValues((previous) => ({ ...previous, [key]: event.target.value }));

  const onSubmit = (event) => {
    if (!noEndpoint) return; // a real endpoint handles it natively
    event.preventDefault();
    const address = [site.email.user, site.email.domain].join(String.fromCharCode(64));
    const subject = encodeURIComponent(`Portfolio enquiry — ${values.name || 'no name'}`);
    const body = encodeURIComponent(
      `${values.message}\n\n—\n${values.name}\n${values.email}`
    );
    window.location.href = `mailto:${address}?subject=${subject}&body=${body}`;
  };

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
          <form onSubmit={onSubmit} className="grid gap-4">
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

            <div>
              <button type="submit" className="btn btn-primary">
                {contact.submit}
              </button>
            </div>
          </form>

          {noEndpoint ? (
            <div className="mt-6">
              <Todo value={contact.endpoint} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
