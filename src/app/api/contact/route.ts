/**
 * Contact form API route — POST handler for /api/contact.
 *
 * Receives contact form submissions from the ContactForm client component,
 * validates them server-side, and forwards the data as an email via the
 * Resend API.
 *
 * Security measures:
 *   - Honeypot field: silently rejects bot submissions (BUG-025).
 *     Bots fill the hidden honeypot input; the server returns 200 without
 *     processing so bots believe the submission succeeded.
 *   - Rate limiting: in-memory per-IP sliding-window limiter
 *     (max 5 requests per minute per IP). Prevents abuse and brute-force
 *     spam without requiring external infrastructure.
 *   - Server-side validation: all required fields (firstName, lastName,
 *     email, message) are checked for presence and non-emptiness. Email
 *     format is validated with a basic regex.
 *
 * Response codes:
 *   - 200: Success (or silent honeypot rejection)
 *   - 400: Validation failure (missing/invalid fields)
 *   - 429: Rate limit exceeded
 *   - 500: Email service failure or missing RESEND_API_KEY
 *
 * @module api/contact
 * @requirements 9.8, 18.2
 * @see design.md — Contact Form API Route specification
 */
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import type { ContactFormData } from '@/lib/types';

/* ================================================================
 * HTML Escaping (BUG-091 fix)
 * ----------------------------------------------------------------
 * Escapes HTML special characters in user-supplied strings before
 * interpolating them into the email template. Prevents stored XSS
 * if the email is rendered in a web-based mail client.
 * ================================================================ */

/**
 * Escapes HTML special characters to prevent XSS in the email template.
 * Replaces the five characters that can break out of HTML attribute or
 * text contexts: &, <, >, ", and '.
 *
 * @param str - Raw user input string
 * @returns The string with dangerous characters replaced by HTML entities
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ================================================================
 * Rate Limiter
 * ----------------------------------------------------------------
 * Simple in-memory sliding-window rate limiter keyed by client IP.
 * Suitable for single-instance deployments. For multi-instance or
 * serverless environments, replace with Redis or an edge middleware.
 * ================================================================ */

/** Stores an array of request timestamps per IP address. */
const rateLimitMap = new Map<string, number[]>();

/** Maximum number of requests allowed per IP within the time window. */
const RATE_LIMIT_MAX = 5;

/** Sliding window duration in milliseconds (1 minute). */
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

/**
 * Determines whether the given IP has exceeded the rate limit.
 *
 * Maintains a sliding window of request timestamps per IP.
 * Timestamps older than RATE_LIMIT_WINDOW_MS are pruned on each call.
 * Stale IP entries with empty timestamp arrays are deleted to prevent
 * unbounded Map growth (BUG-092 fix).
 *
 * @param ip - The client IP address extracted from request headers
 * @returns `true` if the IP has hit or exceeded RATE_LIMIT_MAX requests
 *          within the current window; `false` otherwise
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];

  /* Remove timestamps that have fallen outside the sliding window */
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    /* Update the map with pruned timestamps even when rejecting */
    rateLimitMap.set(ip, recent);
    return true;
  }

  /* Record this request and allow it through */
  recent.push(now);
  rateLimitMap.set(ip, recent);

  /* BUG-092 fix: Purge stale IP entries to prevent unbounded Map growth.
   * After pruning, any IP with an empty timestamp array is no longer
   * relevant and can be safely removed from the map. */
  for (const [key, ts] of rateLimitMap) {
    const activeTimes = ts.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (activeTimes.length === 0) {
      rateLimitMap.delete(key);
    } else if (key !== ip) {
      /* Update other IPs with their pruned timestamps */
      rateLimitMap.set(key, activeTimes);
    }
  }

  return false;
}

/* ================================================================
 * Validation
 * ================================================================ */

/**
 * Basic email format regex.
 * Checks for: non-whitespace @ non-whitespace . non-whitespace.
 * Intentionally simple — covers the vast majority of valid addresses
 * without over-engineering RFC 5322 compliance.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates the contact form payload server-side.
 *
 * Ensures all required fields (firstName, lastName, email, message)
 * are present and non-empty after trimming whitespace. Also validates
 * that the email field matches a basic format pattern.
 *
 * @param data - The parsed ContactFormData payload from the request body
 * @returns An error message string describing the first validation failure,
 *          or `null` if all fields are valid
 */
function validateFormData(data: ContactFormData): string | null {
  const { firstName, lastName, email, message } = data;

  /* Check each required field for presence and non-empty content */
  if (!firstName || !firstName.trim()) {
    return 'First name is required.';
  }
  if (!lastName || !lastName.trim()) {
    return 'Last name is required.';
  }
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  /* Validate email format after confirming it's non-empty */
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Please provide a valid email address.';
  }
  if (!message || !message.trim()) {
    return 'Message is required.';
  }

  return null;
}

/* ================================================================
 * Configuration
 * ================================================================ */

/**
 * The email address that receives contact form submissions.
 * Updated to the project owner's preferred inbox for lead notifications.
 */
const RECIPIENT_EMAIL = 'keanu@thewealthroom.com';

/* ================================================================
 * POST Handler
 * ================================================================ */

/**
 * Handles POST requests to /api/contact.
 *
 * Processing pipeline:
 * 1. Parse the JSON request body as ContactFormData
 * 2. Honeypot check — return 200 silently if the hidden field is filled
 * 3. Rate limit check — return 429 if the IP has exceeded the threshold
 * 4. Validate required fields — return 400 with error details on failure
 * 5. Verify RESEND_API_KEY is configured — return 500 if missing
 * 6. Send email via Resend — return 500 on service failure
 * 7. Return 200 with { success: true } on success
 *
 * @param req - The incoming Next.js request object
 * @returns A NextResponse with the appropriate status code and JSON body
 */
export async function POST(req: NextRequest) {
  /* --- Step 1: Parse request body --- */
  let data: ContactFormData;

  try {
    data = await req.json();
  } catch {
    /* Malformed JSON or empty body — reject with 400 */
    return NextResponse.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  /* --- Step 2: Honeypot check (BUG-025) ---
   * The honeypot is a hidden form field that real users never see or fill.
   * Bots that auto-fill all fields will populate it. We return 200 so the
   * bot believes the submission succeeded, but we don't process it. */
  if (data.honeypot) {
    return NextResponse.json({ success: true });
  }

  /* --- Step 3: Rate limiting (per-IP sliding window) ---
   * Extract the client IP from standard proxy headers. Falls back to
   * 'unknown' if no IP header is present (e.g. local development). */
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  /* --- Step 4: Server-side field validation --- */
  const validationError = validateFormData(data);
  if (validationError) {
    return NextResponse.json(
      { success: false, error: validationError },
      { status: 400 },
    );
  }

  /* --- Step 5: Verify Resend API key is configured ---
   * The placeholder value 'your_resend_api_key' from .env.example means
   * the key hasn't been set up yet. */
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 'your_resend_api_key') {
    console.error('RESEND_API_KEY is not configured.');
    return NextResponse.json(
      { success: false, error: 'Email service is not configured.' },
      { status: 500 },
    );
  }

  /* --- Step 6: Send email via Resend API (BUG-006/051) ---
   * Constructs a readable HTML email with all form fields and sends it
   * to the configured recipient address. */
  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      /* Custom domain sender — requires DNS verification in Resend dashboard */
      from: 'Keanu Le Roux Website <noreply@keanuleroux.com>',
      to: RECIPIENT_EMAIL,
      /* BUG-091 fix: HTML-escape all user-supplied values before interpolating
       * into the HTML email template. This prevents stored XSS attacks if the
       * email is rendered in a web-based mail client (e.g. Gmail, Outlook web). */
      subject: `New Contact Form Submission from ${escapeHtml(data.firstName.trim())} ${escapeHtml(data.lastName.trim())}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.firstName.trim())} ${escapeHtml(data.lastName.trim())}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email.trim())}</p>
        <p><strong>Phone:</strong> ${escapeHtml(data.phone?.trim() || 'Not provided')}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(data.message.trim()).replace(/\n/g, '<br />')}</p>
      `,
    });

    /* --- Step 7: Success response --- */
    return NextResponse.json({ success: true });
  } catch (error) {
    /* Log the full error for server-side debugging; return a generic
     * message to the client to avoid leaking internal details. */
    console.error('Failed to send email via Resend:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message. Please try again later.' },
      { status: 500 },
    );
  }
}
