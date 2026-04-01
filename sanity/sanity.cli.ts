/**
 * Sanity CLI configuration.
 * Used by the `sanity` CLI tool for deployments, dataset management, and local dev.
 */
import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_PROJECT_ID || "your_project_id",
    dataset: process.env.SANITY_DATASET || "production",
  },
});
