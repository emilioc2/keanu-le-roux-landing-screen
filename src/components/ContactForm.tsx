/**
 * ContactForm.tsx — Contact form section with validation and success state.
 *
 * Client Component — manages form state, submission, and UI transitions.
 *
 * Renders an off-white section with:
 *   - "Get In Touch" heading (italic serif, 3rem) + subtitle
 *   - Form fields: firstName, lastName, email, phone, message
 *   - Hidden honeypot field for spam protection (BUG-025/039)
 *   - Full-width "Send Message" pill button (.btn-submit from globals.css)
 *   - Privacy note below the button
 *   - Success confirmation (green checkmark, heading, message) on submit
 *   - Inline error message on server failure (form stays visible for retry)
 *
 * Form submits to /api/contact via fetch POST with JSON body.
 * Native HTML5 validation via `required` attributes prevents incomplete
 * submissions (Req 9.7). Each input has a visible <label> with matching
 * htmlFor/id attributes for accessibility (Req 13.7).
 *
 * @module ContactForm
 * @requirements 9.1–9.8, 13.7, 18.2
 * @see design.md — ContactForm component specification
 */
'use client';

import { useState, type FormEvent } from 'react';
import type { ContactFormData } from '@/lib/types';
import styles from './ContactForm.module.css';

/**
 * ContactForm section component.
 *
 * Manages three UI states:
 *   1. Default — form visible, ready for input
 *   2. Submitting — form disabled while request is in flight
 *   3. Success — form hidden, confirmation message displayed
 *
 * On server error, an inline error message appears below the submit
 * button and the form remains visible so the visitor can retry.
 *
 * @returns {JSX.Element} The Contact section with form or success confirmation
 */
export default function ContactForm() {
  /** Whether the form was successfully submitted — toggles form vs success view */
  const [submitted, setSubmitted] = useState(false);
  /** Whether a submission request is currently in flight */
  const [submitting, setSubmitting] = useState(false);
  /** Server error message displayed below the submit button on failure */
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles form submission via fetch POST to /api/contact.
   *
   * Flow:
   * 1. Prevents default browser form action
   * 2. Extracts form data from the DOM via FormData
   * 3. POSTs JSON payload to /api/contact
   * 4. On success (ok response): hides form, shows confirmation
   * 5. On failure: shows inline error, form stays visible for retry
   *
   * @param e - The native form submit event
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    /* Extract field values from the form DOM */
    const formData = new FormData(e.currentTarget);

    /* Build the typed payload for the API route */
    const payload: ContactFormData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || undefined,
      message: formData.get('message') as string,
      honeypot: (formData.get('honeypot') as string) || undefined,
    };

    try {
      /* POST to the Next.js API route that forwards to Resend */
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        /* Success — hide form and show confirmation (Req 9.6) */
        setSubmitted(true);
      } else {
        /* Server returned an error — show inline message, keep form visible */
        setError('Something went wrong. Please try again later.');
      }
    } catch {
      /* Network error — show inline message, keep form visible for retry */
      setError('Something went wrong. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className={styles.contact}>
      <div className="container">
        {/* Section header — centred heading + subtitle (Req 9.1).
         * BUG-083 fix: subtitle updated to match prototype/index.html #contact
         * section text: "Ready to take the first step? I'd love to hear from you." */}
        <div className={styles.contactHeader}>
          <h2>Get In Touch</h2>
          <p>
            Ready to take the first step? I&apos;d love to hear from you.
          </p>
        </div>

        {submitted ? (
          /* ----- Success confirmation (Req 9.6) -----
           * Shown after successful form submission.
           * Green checkmark (#4ade80), heading, and message.
           */
          <div className={styles.contactSuccess} data-testid="contact-success">
            {/* Green checkmark SVG icon */}
            <svg
              className={styles.successIcon}
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3>Thank you for reaching out!</h3>
            <p>
              I&apos;ve received your message and will get back to you shortly.
            </p>
          </div>
        ) : (
          /* ----- Contact form (Req 9.2–9.5, 9.7, 13.7) ----- */
          <form
            className={styles.contactForm}
            onSubmit={handleSubmit}
            noValidate={false}
            data-testid="contact-form"
          >
            {/* Honeypot field — hidden spam trap (BUG-025/039).
             * Positioned off-screen, not focusable, no autocomplete.
             * Bots fill this in; server silently rejects if populated.
             * aria-hidden prevents screen readers from announcing it. */}
            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor="honeypot">Do not fill this out</label>
              <input
                type="text"
                id="honeypot"
                name="honeypot"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Name row — firstName + lastName side by side (Req 9.3) */}
            <div className={styles.formRow}>
              {/* First Name field (required) */}
              <div className={styles.formGroup}>
                <label htmlFor="firstName">
                  First Name{' '}
                  <span className={styles.required}>(required)</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                />
              </div>

              {/* Last Name field (required) */}
              <div className={styles.formGroup}>
                <label htmlFor="lastName">
                  Last Name{' '}
                  <span className={styles.required}>(required)</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                />
              </div>
            </div>

            {/* Email Address field (required) */}
            <div className={styles.formGroup}>
              <label htmlFor="email">
                Email Address{' '}
                <span className={styles.required}>(required)</span>
              </label>
              <input type="email" id="email" name="email" required />
            </div>

            {/* Phone Number field (optional) */}
            <div className={styles.formGroup}>
              <label htmlFor="phone">
                Phone Number{' '}
                <span className={styles.optional}>(optional)</span>
              </label>
              <input type="tel" id="phone" name="phone" />
            </div>

            {/* Message textarea (required, min-height 100px) */}
            <div className={styles.formGroup}>
              <label htmlFor="message">
                Message <span className={styles.required}>(required)</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
              />
            </div>

            {/* Submit button — full-width pill using .btn-submit from globals.css (Req 9.4) */}
            <button
              type="submit"
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>

            {/* Inline error message — shown on server failure (design doc spec) */}
            {error && (
              <p className={styles.errorMessage} role="alert">
                {error}
              </p>
            )}

            {/* Privacy note — reassures visitors about data safety (Req 9.5) */}
            <p className={styles.formPrivacy}>
              Your information is safe with me. I will never share your details
              or send you spam.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
