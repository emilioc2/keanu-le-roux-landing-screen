/**
 * ContactForm.unit.test.tsx — Unit tests for the Contact Form component.
 *
 * Covers the key behaviours from Requirements 9.1–9.8:
 *   - Success state display after successful form submission (Req 9.6)
 *   - Honeypot field for spam protection (BUG-025/039, Req 18.2)
 *   - Error state displayed on server failure (design doc spec)
 *   - Privacy note text below the submit button (Req 9.5)
 *   - Label-input association via matching for/id attributes (Req 13.7)
 *
 * Global fetch is mocked to simulate API responses without a real server.
 * Each test restores the original fetch after completion.
 *
 * Addresses: BUG-078 (missing unit tests for ContactForm)
 *
 * @module ContactForm.unit.test
 * @requirements 9.1–9.8, 13.7, 18.2
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ContactForm from '../ContactForm';

/** Store the original global fetch reference so we can restore it after each test */
const originalFetch = global.fetch;

beforeEach(() => {
  /**
   * Mock global fetch by default to return a successful 200 response.
   * Individual tests override this mock when they need to simulate
   * server errors or network failures.
   */
  global.fetch = vi.fn(() =>
    Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }))
  );
});

afterEach(() => {
  /** Restore original fetch and clean up DOM between tests */
  global.fetch = originalFetch;
  cleanup();
  vi.restoreAllMocks();
});

/**
 * Fills all required form fields with valid test data.
 * This helper avoids repetition across tests that need a complete,
 * valid form before triggering submission.
 *
 * Uses fireEvent.change to set input values synchronously,
 * which is compatible with the component's FormData extraction.
 */
function fillRequiredFields(): void {
  /** Fill firstName — required field */
  fireEvent.change(screen.getByLabelText(/First Name/), {
    target: { value: 'John' },
  });
  /** Fill lastName — required field */
  fireEvent.change(screen.getByLabelText(/Last Name/), {
    target: { value: 'Doe' },
  });
  /** Fill email — required field */
  fireEvent.change(screen.getByLabelText(/Email Address/), {
    target: { value: 'john@example.com' },
  });
  /** Fill message — required field */
  fireEvent.change(screen.getByLabelText(/Message/), {
    target: { value: 'Hello, I need financial advice.' },
  });
}

/* =====================================================================
 * Success state display after submit (Req 9.6)
 *
 * After a successful form submission, the form should be hidden and
 * replaced with a success confirmation containing a green checkmark,
 * heading, and message.
 * ===================================================================== */
describe('ContactForm — Success state after submit', () => {
  it('shows success confirmation after successful submission', async () => {
    render(<ContactForm />);
    fillRequiredFields();

    /** Submit the form by clicking the submit button */
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    /** Wait for the async fetch to resolve and React state to update */
    await waitFor(() => {
      expect(screen.getByTestId('contact-success')).toBeTruthy();
    });

    /** Verify the success heading text matches Req 9.6 spec */
    expect(screen.getByText('Thank you for reaching out!')).toBeTruthy();
    /** Verify the success body message */
    expect(
      screen.getByText(/received your message and will get back to you/)
    ).toBeTruthy();
  });

  it('hides the form after successful submission', async () => {
    render(<ContactForm />);
    fillRequiredFields();

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      /** The form element should no longer be in the DOM after success */
      expect(screen.queryByTestId('contact-form')).toBeNull();
    });
  });
});

/* =====================================================================
 * Honeypot rejection (BUG-025/039, Req 18.2)
 *
 * The honeypot field is a hidden input that bots fill in.
 * It must be present in the DOM but hidden from real users via
 * aria-hidden, tabIndex=-1, and off-screen positioning.
 * ===================================================================== */
describe('ContactForm — Honeypot field', () => {
  it('includes a hidden honeypot field with aria-hidden="true"', () => {
    const { container } = render(<ContactForm />);
    const honeypotInput = container.querySelector('input[name="honeypot"]');

    /** Honeypot input must exist in the DOM for bots to discover */
    expect(honeypotInput).not.toBeNull();

    /** The honeypot wrapper must be hidden from screen readers */
    const honeypotWrapper = honeypotInput!.closest('[aria-hidden="true"]');
    expect(honeypotWrapper).not.toBeNull();
  });

  it('honeypot field has tabIndex=-1 to prevent keyboard focus', () => {
    const { container } = render(<ContactForm />);
    const honeypotInput = container.querySelector('input[name="honeypot"]');

    /** tabIndex=-1 prevents keyboard users from accidentally focusing the trap */
    expect(honeypotInput!.getAttribute('tabindex')).toBe('-1');
  });
});

/* =====================================================================
 * Error state on server failure (design doc spec)
 *
 * When the API returns an error, the form should display an inline
 * error message and remain visible so the user can retry.
 * ===================================================================== */
describe('ContactForm — Error state on server failure', () => {
  it('shows error message when server returns non-ok response', async () => {
    /** Override fetch to simulate a server error (HTTP 500) */
    global.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ error: 'fail' }), { status: 500 }))
    );

    render(<ContactForm />);
    fillRequiredFields();

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      /** Error message should appear below the submit button */
      expect(
        screen.getByText('Something went wrong. Please try again later.')
      ).toBeTruthy();
    });

    /** Form should remain visible for retry — not replaced by success state */
    expect(screen.getByTestId('contact-form')).toBeTruthy();
  });

  it('shows error message on network failure (e.g. offline)', async () => {
    /** Override fetch to simulate a network error */
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    render(<ContactForm />);
    fillRequiredFields();

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      /** Same user-facing error message for any type of failure */
      expect(
        screen.getByText('Something went wrong. Please try again later.')
      ).toBeTruthy();
    });
  });
});

/* =====================================================================
 * Privacy note text (Req 9.5)
 *
 * A privacy reassurance note must appear below the submit button
 * to build trust with visitors submitting their personal information.
 * ===================================================================== */
describe('ContactForm — Privacy note', () => {
  it('displays the privacy note text below the form', () => {
    render(<ContactForm />);

    /** Privacy note reassures visitors about data safety (Req 9.5) */
    expect(
      screen.getByText(/Your information is safe with me/)
    ).toBeTruthy();
    expect(
      screen.getByText(/I will never share your details or send you spam/)
    ).toBeTruthy();
  });
});

/* =====================================================================
 * Label-input association (Req 13.7)
 *
 * Every visible input/textarea must have a <label> with a matching
 * `for` attribute pointing to the input's `id`. This is required
 * for screen reader accessibility.
 * ===================================================================== */
describe('ContactForm — Label-input association', () => {
  it('every visible input has a label with matching for/id attributes', () => {
    const { container } = render(<ContactForm />);
    const form = container.querySelector('form')!;

    /**
     * The 5 visible fields that must have associated labels.
     * The honeypot field is excluded — it's intentionally hidden
     * from assistive technology via aria-hidden="true".
     */
    const visibleFieldIds = ['firstName', 'lastName', 'email', 'phone', 'message'];

    visibleFieldIds.forEach((id) => {
      const input = form.querySelector(`#${id}`);
      /** Each field must have a non-null element with the expected id */
      expect(input).not.toBeNull();

      const label = form.querySelector(`label[for="${id}"]`);
      /** A matching label must exist for accessibility compliance */
      expect(label).not.toBeNull();
      /** The label must contain visible text content */
      expect(label!.textContent!.trim().length).toBeGreaterThan(0);
    });
  });
});
