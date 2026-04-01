/**
 * Sanity Studio configuration.
 * Defines the project ID, dataset, and schema types for the Sanity CMS dashboard.
 * The Admin_User (Keanu) uses this to manage blog posts (Req 15.1).
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import blogPost from "./schemas/blogPost";

export default defineConfig({
  // Project ID and dataset are configured in .env.local
  projectId: process.env.SANITY_PROJECT_ID || "your_project_id",
  dataset: process.env.SANITY_DATASET || "production",

  // Register content schemas — only blog posts are CMS-managed
  schema: {
    types: [blogPost],
  },

  // Enable the Structure Tool for content management UI
  plugins: [structureTool()],
});
