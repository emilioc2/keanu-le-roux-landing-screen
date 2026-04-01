/**
 * Vitest global setup file.
 * Extends Vitest's expect with Testing Library's custom DOM matchers
 * (e.g. toBeInTheDocument, toHaveAttribute, toBeVisible).
 */
import "@testing-library/jest-dom/vitest";
