import { NextResponse } from 'next/server';
import { Resend } from 'resend';

import site from '@/content/site.json';

/**
 * Contact form backend.
 *
 * Answers two kinds of caller with the same validation and the same send:
 *
 *   - `fetch` from the enhanced form, sending JSON, wanting JSON back
 *   - a plain browser form POST with JS disabled, sending form-encoded fields
 *     and expecting somewhere to land
 *
 * The second case is why the form keeps `action` and `method` in the markup.
 * A visitor with JS off still gets a working form and a redirect that says what
 * happened, rather than a page that silently does nothing.
 *
 * Credentials come from the environment and are never imported into client
 * code — this file only ever runs on the server.
 */

const LIMITS = { name: 100, email: 200, message: 5000 };

/** Never let a header be forged by putting a newline in a field. */
const oneLine = (value) => String(value).replace(/[\r\n]+/g, ' ').trim();

/**
 * Deliberately permissive: `x@y` is a valid address, and every stricter regex
 * on the internet rejects mail somebody genuinely uses. Resend does the real
 * validation, and a bounce is a better failure than a false rejection.
 */
const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function validate(fields) {
  const name = oneLine(fields.name ?? '');
  const email = oneLine(fields.email ?? '');
  const message = String(fields.message ?? '').trim();

  if (!name || !email || !message) return { error: 'All three fields are required.' };
  if (!looksLikeEmail(email)) return { error: 'That email address does not look right.' };
  if (name.length > LIMITS.name) return { error: 'That name is too long.' };
  if (email.length > LIMITS.email) return { error: 'That email address is too long.' };
  if (message.length > LIMITS.message) return { error: 'That message is too long.' };

  return { name, email, message };
}

export async function POST(request) {
  const contentType = request.headers.get('content-type') ?? '';
  const wantsJson = contentType.includes('application/json');

  let fields;
  try {
    if (wantsJson) {
      fields = await request.json();
    } else {
      fields = Object.fromEntries(await request.formData());
    }
  } catch {
    return respond(wantsJson, request, 400, 'That request could not be read.');
  }

  const parsed = validate(fields);
  if (parsed.error) return respond(wantsJson, request, 400, parsed.error);

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Misconfiguration, not the visitor's fault — say so plainly in the log and
    // vaguely to them, because the detail is ours and not theirs.
    console.error('RESEND_API_KEY is not set; contact form cannot send.');
    return respond(wantsJson, request, 500, 'The form is not accepting messages right now.');
  }

  const to = `${site.email.user}@${site.email.domain}`;
  const from = process.env.CONTACT_FROM || 'Portfolio <onboarding@resend.dev>';

  try {
    const { error } = await new Resend(key).emails.send({
      from,
      to,
      // Replying goes to the visitor rather than to the sender address, which is
      // the only reason this form is more useful than a mailto link.
      replyTo: parsed.email,
      subject: `Portfolio enquiry — ${parsed.name}`,
      text: `${parsed.message}\n\n—\n${parsed.name}\n${parsed.email}`,
    });

    if (error) {
      console.error('Resend rejected the message:', error);
      return respond(wantsJson, request, 502, 'The message could not be sent. Try email instead.');
    }
  } catch (cause) {
    console.error('Contact form send failed:', cause);
    return respond(wantsJson, request, 502, 'The message could not be sent. Try email instead.');
  }

  return respond(wantsJson, request, 200, null);
}

/**
 * JSON for the enhanced form; a redirect back to the contact section for a
 * plain form POST, carrying the outcome in the query string so the page can
 * say what happened without any script running.
 */
function respond(wantsJson, request, status, error) {
  if (wantsJson) {
    return NextResponse.json(error ? { error } : { ok: true }, { status });
  }
  const url = new URL(error ? '/?sent=error#contact' : '/?sent=ok#contact', request.url);
  return NextResponse.redirect(url, 303);
}

/** A GET here is someone poking at the URL; say so rather than 405-ing blankly. */
export async function GET() {
  return NextResponse.json({ error: 'Send a POST from the contact form.' }, { status: 405 });
}
