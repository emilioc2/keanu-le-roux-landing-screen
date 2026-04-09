/**
 * Newsletter.tsx — Navy CTA section with inline email subscription form.
 *
 * Client Component — manages form state, submission, and UI transitions.
 *
 * Renders a navy background section with:
 *   - "Stay Ahead of the Curve" heading (italic serif, white)
 *   - Description paragraph (light white, opacity 0.7)
 *   - Three benefit items with checkmark (✓) prefixes
 *   - Inline email form with hidden honeypot, email input, and Subscribe button
 *   - Success state: green checkmark + "Thank you for subscribing!" message
 *   - Error state: inline retry message with role="alert"
 *   - Loading state: disabled button with "Subscribing..." text
 *
 * Form submits to /api/newsletter via fetch POST with JSON body.
 * Programmatic email validation runs before the fetch call (Req 4 AC 12).
 *
 * @module Newsletter
 * @requirements Req 4 AC 1–17
 * @see design.md — Newsletter component specification (Section 4.3)
 */
'use client';

import { useState, type FormEvent } from 'react';
import styles from './Newsletter.module.css';

/**
 * Three subscriber benefits displayed with checkmark prefixes.
 * Content matches the prototype newsletter section exactly (Req 4 AC 13).
 */
const BENEFITS = [
  'Practical wealth-building strategies',
  'Market updates and economic insights',
  'Tips for smarter financial decisions',
] as const;

/**
 * Basic email format regex for programmatic validation (Req 4 AC 12).
 * Checks for: non-whitespace @ non-whitespace . non-whitespace.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Newsletter section component.
 *
 * Manages four UI states via a single state variable to prevent
 * impossible state combinations (e.g. submitting AND error):
 *   - idle: form visible, ready for input
 *   - submitting: form visible, button disabled with "Subscribing..." text
 *   - success: form replaced with green checkmark confirmation
 *   - error: form visible with inline error message for retry
 *
 * @returns {JSX.Element} The Newsletter section with heading, description, benefits, and form
 */
export default function Newsletter() {
  /** Single state variable controls all UI transitions (design doc Section 3) */
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  /**
   * Handles newsletter form submission via fetch POST to /api/newsletter.
   *
   * Flow:
   * 1. Prevent default browser form action
   * 2. Validate email programmatically (empty check + regex) — return early if invalid
   * 3. Set state to 'submitting'
   * 4. Extract email and honeypot from FormData
   * 5. POST JSON to /api/newsletter
   * 6. On res.ok → set 'success'; otherwise → set 'error'
   * 7. On network error → set 'error'
   *
   * @param e - The native form submit event
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    /* Extract field values from the form DOM */
    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string || '').trim();
    const honeypot = (formData.get('honeypot') as string) || '';

    /* Programmatic validation before fetch (Req 4 AC 12) —
     * HTML5 required + type="email" provides browser-native validation,
     * but the spec explicitly requires programmatic checks too. */
    if (!email || !EMAIL_REGEX.test(email)) {
      return;
    }

    setFormState('submitting');

    try {
      /* POST to the Next.js API route that forwards to Resend */
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, honeypot }),
      });

      if (res.ok) {
        /* Success — replace form with confirmation message (Req 4 AC 10) */
        setFormState('success');
      } else {
        /* Server returned an error — show inline message for retry (Req 4 AC 11) */
        setFormState('error');
      }
    } catch {
      /* Network error — show inline message for retry */
      setFormState('error');
    }
  }

  return (
    <section id="newsletter" className={styles.newsletter}>
      {/* BUG-077 fix: .container wrapper for horizontal padding */}
      <div className="container">
        {/* Constrained content wrapper — max 560px centred (design doc spec) */}
        <div className={styles.newsletterContent}>
          {/* Section heading — italic serif, white (Req 4 AC 13) */}
          <h2 className={styles.heading}>Stay Ahead of the Curve</h2>

          {/* Value proposition paragraph — light white at 70% opacity (Req 4 AC 13) */}
          <p className={styles.description}>
            Join my newsletter for weekly financial insights, market commentary,
            planning tips and exclusive content — delivered straight to your inbox.
          </p>

          {/* Benefit list — three inline items with checkmark prefixes (Req 4 AC 13) */}
          <ul className={styles.benefits}>
            {BENEFITS.map((benefit) => (
              <li key={benefit} className={styles.benefit}>
                {/* Checkmark prefix — aria-hidden since it's decorative */}
                <span className={styles.checkmark} aria-hidden="true">
                  ✓
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          {formState === 'success' ? (
            /* ----- Success confirmation (Req 4 AC 10) -----
             * Shown after successful form submission.
             * Green checkmark (#4ade80), heading, and subtitle. */
            <div className={styles.newsletterSuccess} data-testid="newsletter-success">
              {/* Green checkmark SVG icon — colour #4ade80 per design spec */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4ade80"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h3>Thank you for subscribing!</h3>
              <p>You&apos;ll hear from me soon.</p>
            </div>
          ) : (
            /* ----- Newsletter form (Req 4 AC 1–6, AC 14) ----- */
            <form
              className={styles.newsletterForm}
              onSubmit={handleSubmit}
              data-testid="newsletter-form"
            >
              {/* Honeypot field — hidden spam trap (BUG-203, Req 4 AC 17).
               * Positioned off-screen, not focusable, no autocomplete.
               * Bots fill this in; server silently rejects if populated. */}
              <div className={styles.honeypot} aria-hidden="true">
                <label htmlFor="newsletter-honeypot">Do not fill this out</label>
                <input
                  type="text"
                  id="newsletter-honeypot"
                  name="honeypot"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Email input — bottom-border-only style (Req 4 AC 2, AC 3, AC 14) */}
              <input
                type="email"
                name="email"
                required
                aria-label="Email address for newsletter"
                placeholder="Enter your email address"
                data-testid="newsletter-email"
              />

              {/* Subscribe button — CSS Module class .btnNewsletter (Req 4 AC 4, AC 15) */}
              <button
                type="submit"
                className={styles.btnNewsletter}
                disabled={formState === 'submitting'}
                data-testid="newsletter-subscribe"
              >
                {formState === 'submitting' ? 'Subscribing...' : 'Subscribe'}
              </button>

              {/* Inline error message — shown on submission failure (Req 4 AC 11) */}
              {formState === 'error' && (
                <p className={styles.newsletterError} role="alert" data-testid="newsletter-error">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          )}
        </div>{/* end .newsletterContent */}
      </div>{/* end .container */}
    </section>
  );
}
