/**
 * Newsletter subscription API route — POST handler for /api/newsletter.
 *
 * Receives newsletter subscription requests from the Newsletter client
 * component, validates the email, and forwards a notification email to
 * Keanu via the Resend API.
 *
 * Security measures:
 *   - Honeypot field: silently rejects bot submissions (BUG-203).
 *     Bots fill the hidden honeypot input; the server returns 200 without
 *     processing so bots believe the submission succeeded.
 *   - Rate limiting: in-memory per-IP sliding-window limiter
 *     (max 5 requests per minute per IP). Prevents abuse and brute-force
 *     spam without requiring external infrastructure.
 *   - HTML escaping: subscriber email is escaped before interpolation
 *     into the email template to prevent stored XSS (BUG-201).
 *
 * Response codes:
 *   - 200: Success (or silent honeypot rejection)
 *   - 400: Missing/invalid email
 *   - 429: Rate limit exceeded
 *   - 500: Email service failure or missing RESEND_API_KEY
 *
 * @module api/newsletter
 * @requirements Req 4 AC 7, AC 8, AC 9, AC 16, AC 17
 * @see design.md — Newsletter API Route specification (Section 5)
 */
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

/* ================================================================
 * HTML Escaping (BUG-201 fix)
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
 * unbounded Map growth.
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

  /* Purge stale IP entries to prevent unbounded Map growth.
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

/* ================================================================
 * Configuration
 * ================================================================ */

/**
 * The email address that receives newsletter subscription notifications.
 * Updated to the project owner's preferred inbox — matches the contact form recipient.
 */
const RECIPIENT_EMAIL = 'keanu@thewealthroom.com';

/* ================================================================
 * POST Handler
 * ================================================================ */

/**
 * Handles POST requests to /api/newsletter.
 *
 * Processing pipeline:
 * 1. Parse the JSON request body
 * 2. Honeypot check — return 200 silently if the hidden field is filled
 * 3. Rate limit check — return 429 if the IP has exceeded the threshold
 * 4. Validate email — return 400 if missing or invalid format
 * 5. Verify RESEND_API_KEY is configured — return 500 if missing
 * 6. HTML-escape email before interpolation into template
 * 7. Send email via Resend — return 500 on service failure
 * 8. Return 200 with { success: true } on success
 *
 * @param req - The incoming Next.js request object
 * @returns A NextResponse with the appropriate status code and JSON body
 */
export async function POST(req: NextRequest) {
  /* --- Step 1: Parse request body --- */
  let data: { email?: string; honeypot?: string };

  try {
    data = await req.json();
  } catch {
    /* Malformed JSON or empty body — reject with 400 */
    return NextResponse.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  /* --- Step 2: Honeypot check (BUG-203) ---
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

  /* --- Step 4: Validate email ---
   * Email is required, must be non-empty after trimming, and must match
   * a basic format regex. */
  const email = typeof data.email === 'string' ? data.email.trim() : '';

  if (!email) {
    return NextResponse.json(
      { success: false, error: 'Email address is required.' },
      { status: 400 },
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { success: false, error: 'Please provide a valid email address.' },
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

  /* --- Step 6 & 7: HTML-escape and send via Resend ---
   * The subscriber email is escaped before interpolation into the HTML
   * template to prevent stored XSS in web-based mail clients (BUG-201). */
  const resend = new Resend(apiKey);
  const safeEmail = escapeHtml(email);

  try {
    await resend.emails.send({
      /* Custom domain sender — requires DNS verification in Resend dashboard */
      from: 'Keanu Le Roux Website <noreply@keanuleroux.com>',
      to: RECIPIENT_EMAIL,
      /* Subject clearly identifies this as a newsletter subscription,
       * distinct from contact form submissions (Req 4 AC 8). */
      subject: 'New Newsletter Subscription',
      html: `
        <h2>New Newsletter Subscription</h2>
        <p>A new visitor has subscribed to your newsletter.</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <hr />
        <p><em>This is a newsletter subscription request — not a contact form submission.</em></p>
      `,
    });

    /* --- Step 8: Success response --- */
    return NextResponse.json({ success: true });
  } catch (error) {
    /* Log the full error for server-side debugging; return a generic
     * message to the client to avoid leaking internal details. */
    console.error('Failed to send newsletter email via Resend:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message. Please try again later.' },
      { status: 500 },
    );
  }
}
