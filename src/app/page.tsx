/**
 * Landing Page — Server Component that composes all section components.
 *
 * This is the root page for the Keanu Le Roux Financial Advisor website.
 * It fetches published blog posts from Sanity CMS at render time and passes
 * them to the Blog section component. All other sections use static data.
 *
 * ISR (Incremental Static Regeneration) is set to 60 seconds so the page
 * re-renders periodically to pick up new blog posts without a full rebuild.
 *
 * The component order matches the prototype's visual section order:
 * Navbar → Hero → About → Services → Blog → SocialFeed → Newsletter →
 * Partners → ContactForm → Footer
 *
 * Note: Navbar and Footer render inside the <main> from layout.tsx.
 * This is a known layout issue (BUG-044) to be addressed separately.
 *
 * Requirements: 5.8 (featured post display), 15.5 (auto-display newest)
 */

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Blog from '@/components/Blog';
import SocialFeed from '@/components/SocialFeed';
import Newsletter from '@/components/Newsletter';
import Partners from '@/components/Partners';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import { sanityClient, allPublishedPostsQuery, isSanityConfigured } from '@/lib/sanity';
import type { BlogPost } from '@/lib/types';

/** ISR revalidation interval — re-fetch CMS data every 60 seconds */
export const revalidate = 60;

/**
 * Home — async Server Component that fetches blog posts and renders
 * all landing page sections in the correct visual order.
 *
 * The Sanity fetch is wrapped in try/catch so a CMS failure doesn't
 * break the entire page. If the fetch fails, an empty array is passed
 * to the Blog component, which handles the placeholder fallback (Req 5 AC 9).
 */
export default async function Home() {
  /** Holds published blog posts from Sanity CMS; defaults to empty on failure */
  let posts: BlogPost[] = [];

  /**
   * Only attempt the Sanity fetch when the project ID is valid (a-z, 0-9, hyphens).
   * Placeholder values like "your_project_id" contain underscores which cause
   * the Sanity client to throw at instantiation time — before the try/catch
   * can catch anything. When unconfigured, the Blog component receives an
   * empty array and renders its placeholder fallback (Req 5 AC 9).
   */
  if (isSanityConfigured() && sanityClient) {
    try {
      /* Fetch all published posts sorted by publishedAt descending (newest first) */
      posts = await sanityClient.fetch<BlogPost[]>(allPublishedPostsQuery);
    } catch {
      /* CMS fetch failed — Blog component will show placeholder content (Req 5 AC 9) */
    }
  }

  return (
    <>
      {/* Fixed navigation bar — transparent over hero, white on scroll */}
      <Navbar />
      {/* Full-viewport hero with video background and dual CTAs */}
      <Hero />
      {/* Bio, portrait, and accordion (approach/qualifications/why) */}
      <About />
      {/* Service images and 7-item accordion */}
      <Services />
      {/* Featured post + card grid — receives CMS posts or empty array for fallback */}
      <Blog posts={posts} />
      {/* YouTube, LinkedIn, Instagram feed cards */}
      <SocialFeed />
      {/* Navy CTA section with external subscribe link */}
      <Newsletter />
      {/* Static partner logo row */}
      <Partners />
      {/* Lead-capture form with validation and success state */}
      <ContactForm />
      {/* Branding, social icons, contact details, copyright */}
      <Footer />
    </>
  );
}
