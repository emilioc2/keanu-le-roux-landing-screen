/**
 * Accordion.property.test.tsx — Property-based tests for the Accordion component.
 *
 * Uses fast-check to generate random accordion configurations and click sequences,
 * then verifies two key invariants:
 *
 * Property 1 (Mutual Exclusion): After clicking item X, exactly item X is expanded
 *   and all other N-1 items are collapsed. (Validates: Req 3.6, 4.5)
 *
 * Property 9 (aria-expanded Reflects State): After any random click sequence,
 *   aria-expanded="true" on the open item and "false" on all others.
 *   (Validates: Req 13.4)
 *
 * @see design.md — Correctness Properties 1 and 9
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import fc from 'fast-check';
import Accordion from '../Accordion';
import type { AccordionItem } from '../Accordion';

/**
 * Helper: builds an array of N accordion items with predictable titles.
 * Each item has a unique title "Item {i}" and simple paragraph content.
 *
 * @param n - Number of items to generate
 * @returns Array of AccordionItem objects
 */
function buildItems(n: number): AccordionItem[] {
  return Array.from({ length: n }, (_, i) => ({
    title: `Item ${i}`,
    content: <p>Content for item {i}</p>,
  }));
}

/**
 * Helper: retrieves all accordion header buttons from the rendered DOM.
 * Buttons are identified by their role and the presence of aria-expanded.
 *
 * @returns Array of HTMLElement buttons in document order
 */
function getAllHeaders(): HTMLElement[] {
  return screen.getAllByRole('button');
}

/**
 * Replays a click sequence to determine the expected open index.
 * Mirrors the Accordion's toggle logic: clicking an open item closes it (-1),
 * clicking a closed item opens it and closes the previous.
 *
 * @param clickSequence - Raw random integers from fast-check
 * @param numItems - Total number of accordion items
 * @param defaultOpen - Initial open index (default: 0)
 * @returns The index of the expected open item, or -1 if all closed
 */
function replayExpectedOpen(
  clickSequence: number[],
  numItems: number,
  defaultOpen: number
): number {
  let open = defaultOpen;
  for (const raw of clickSequence) {
    const idx = raw % numItems;
    open = open === idx ? -1 : idx;
  }
  return open;
}


describe('Accordion — Property 1: Mutual Exclusion', () => {
  it('after any click sequence, at most one item is expanded and it is the correct one', () => {
    fc.assert(
      fc.property(
        /* Generate accordion size between 2 and 10 items */
        fc.integer({ min: 2, max: 10 }),
        /* Generate a sequence of 1–20 random click target indices */
        fc.array(fc.nat(), { minLength: 1, maxLength: 20 }),
        (numItems, clickSequence) => {
          const items = buildItems(numItems);

          /* Render accordion with first item open by default */
          const { unmount } = render(<Accordion items={items} defaultOpenIndex={0} />);

          const headers = getAllHeaders();

          /* Execute each click in the random sequence */
          for (const rawIndex of clickSequence) {
            const clickIndex = rawIndex % numItems;
            fireEvent.click(headers[clickIndex]);
          }

          /* Determine expected state by replaying the toggle logic */
          const expectedOpen = replayExpectedOpen(clickSequence, numItems, 0);

          /* Count how many items report as expanded */
          const expandedCount = headers.filter(
            (h) => h.getAttribute('aria-expanded') === 'true'
          ).length;

          if (expectedOpen === -1) {
            /* All items should be collapsed — zero expanded */
            expect(expandedCount).toBe(0);
          } else {
            /* Exactly one item should be expanded */
            expect(expandedCount).toBe(1);
            expect(headers[expectedOpen].getAttribute('aria-expanded')).toBe('true');
          }

          /* Clean up to avoid DOM leaks between property runs */
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Accordion — Property 9: aria-expanded Reflects State', () => {
  it('aria-expanded is "true" on the open item and "false" on all others after any click sequence', () => {
    fc.assert(
      fc.property(
        /* Generate accordion size between 2 and 8 items */
        fc.integer({ min: 2, max: 8 }),
        /* Generate a sequence of 1–15 random click target indices */
        fc.array(fc.nat(), { minLength: 1, maxLength: 15 }),
        (numItems, clickSequence) => {
          const items = buildItems(numItems);

          /* Render accordion with first item open by default */
          const { unmount } = render(<Accordion items={items} defaultOpenIndex={0} />);

          const headers = getAllHeaders();

          /* Execute each click in the random sequence */
          for (const rawIndex of clickSequence) {
            const clickIndex = rawIndex % numItems;
            fireEvent.click(headers[clickIndex]);
          }

          /* Determine expected state by replaying the toggle logic */
          const expectedOpen = replayExpectedOpen(clickSequence, numItems, 0);

          /* Verify aria-expanded on every header matches expected state */
          headers.forEach((header, i) => {
            const expectedValue = i === expectedOpen ? 'true' : 'false';
            expect(header.getAttribute('aria-expanded')).toBe(expectedValue);
          });

          /* Clean up to avoid DOM leaks between property runs */
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });
});
