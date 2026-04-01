/**
 * ContactForm.property.test.tsx — Property-based tests for the Contact Form.
 *
 * Property 5: Contact form validation rejects incomplete submissions
 *   - For any combination of empty required fields, the form prevents
 *     submission and no success message is shown.
 *   - Uses fast-check to generate random empty/filled required field combos.
 *   - numRuns: 100
 *   - Validates: Requirements 9.7
 *
 * Property 11: Form inputs have associated labels
 *   - Every visible <input> and <textarea> in the contact form has a
 *     <label> with a matching `for`/`id` attribute pair.
 *   - numRuns: 100
 *   - Validates: Requirements 13.7
 *
 * @see design.md — Correctness Properties 5 and 11
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/react';
import fc from 'fast-check';
import ContactForm from '../ContactForm';

/**
 * Clean up the DOM after each test to prevent leftover nodes
 * from previous fast-check iterations causing query collisions.
 */
afterEach(() => {
  cleanup();
});


/* =====================================================================
 * Property 5: Contact form validation rejects incomplete submissions
 * Validates: Requirements 9.7
 * ===================================================================== */
describe('ContactForm — Property 5: Validation rejects incomplete submissions', () => {
  /**
   * For any contact form submission where at least one required field
   * is empty, the form should fail HTML5 constraint validation and
   * no success message should appear.
   *
   * Strategy:
   * - Generate a boolean mask for each required field (true=fill, false=empty)
   * - Filter out the all-true case (that would be a valid submission)
   * - Fill the "true" fields with random non-empty strings via fireEvent.change
   * - Check that form.checkValidity() returns false (native HTML5 validation)
   * - Submit the form and verify no success confirmation appears
   *
   * Uses fireEvent (synchronous) rather than userEvent to keep the
   * property function synchronous, which fast-check's fc.property requires.
   */
  it('does not show success message when at least one required field is empty', () => {
    fc.assert(
      fc.property(
        /* Boolean for each required field: true = fill it, false = leave empty */
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        /* Random non-empty values for fields that will be filled */
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.emailAddress(),
        fc.string({ minLength: 1, maxLength: 200 }),
        (
          fillFirst,
          fillLast,
          fillEmail,
          fillMsg,
          firstVal,
          lastVal,
          emailVal,
          msgVal
        ) => {
          /* Skip the all-filled case — we only test incomplete submissions */
          if (fillFirst && fillLast && fillEmail && fillMsg) return;

          /* Render the ContactForm component */
          const { unmount } = render(<ContactForm />);

          /* Map of fields to conditionally fill based on generated booleans */
          const fields = [
            { id: 'firstName', fill: fillFirst, value: firstVal },
            { id: 'lastName', fill: fillLast, value: lastVal },
            { id: 'email', fill: fillEmail, value: emailVal },
            { id: 'message', fill: fillMsg, value: msgVal },
          ];

          /* Fill only the fields marked as true using fireEvent.change */
          for (const f of fields) {
            if (f.fill) {
              const el = document.getElementById(f.id);
              if (el) {
                fireEvent.change(el, { target: { value: f.value } });
              }
            }
          }

          /* Verify native HTML5 validation rejects the incomplete form.
           * checkValidity() returns false when any required field is empty. */
          const form = screen.getByTestId('contact-form') as HTMLFormElement;
          expect(form.checkValidity()).toBe(false);

          /* Attempt to submit — click the submit button */
          const btn = screen.getByRole('button', { name: /send message/i });
          fireEvent.click(btn);

          /* Success confirmation must NOT appear when required fields are missing */
          expect(screen.queryByTestId('contact-success')).toBeNull();

          /* Clean up DOM for next fast-check iteration */
          unmount();
        }
      ),
      /* Run 100 iterations as specified in the task requirements */
      { numRuns: 100 }
    );
  });
});

/* =====================================================================
 * Property 11: Form inputs have associated labels
 * Validates: Requirements 13.7
 * ===================================================================== */
describe('ContactForm — Property 11: Form inputs have associated labels', () => {
  /**
   * Every visible <input> and <textarea> in the contact form must have
   * a <label> element whose `for` attribute matches the input's `id`.
   *
   * The honeypot field is excluded — it's intentionally hidden from
   * assistive tech via aria-hidden="true".
   *
   * Uses a constant arbitrary since this is a structural property
   * that doesn't depend on input data.
   */
  it('every visible input and textarea has a label with matching for/id', () => {
    fc.assert(
      fc.property(
        /* Constant arbitrary — structural check, not data-dependent */
        fc.constant(null),
        () => {
          /* Render the ContactForm component */
          const { unmount, container } = render(<ContactForm />);

          /* Get the form element */
          const form = container.querySelector('form');
          expect(form).not.toBeNull();

          /* Query all input and textarea elements within the form */
          const inputs = form!.querySelectorAll('input, textarea');

          /* At least 5 visible fields: firstName, lastName, email, phone, message
           * (plus the honeypot which we skip below) */
          expect(inputs.length).toBeGreaterThanOrEqual(5);

          /* Check each input/textarea for a matching label */
          inputs.forEach((input) => {
            const id = input.getAttribute('id');
            const name = input.getAttribute('name');

            /* Skip honeypot — intentionally hidden from screen readers */
            if (name === 'honeypot') return;

            /* Every visible input must have a non-empty id attribute */
            expect(id).toBeTruthy();

            /* A <label> with matching for attribute must exist (Req 13.7) */
            const label = form!.querySelector(`label[for="${id}"]`);
            expect(label).not.toBeNull();

            /* The label must contain visible text content */
            expect(label!.textContent!.trim().length).toBeGreaterThan(0);
          });

          /* Clean up DOM for next fast-check iteration */
          unmount();
        }
      ),
      /* Run 100 iterations as specified in the task requirements */
      { numRuns: 100 }
    );
  });
});
