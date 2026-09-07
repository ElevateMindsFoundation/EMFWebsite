import { useEffect } from 'react';

const SITE_NAME = 'Elevate Minds Foundation';

const DEFAULT_DESCRIPTION =
  "Elevate Minds Foundation designs and delivers free AI-powered tools and programs for children with physical, developmental, and neurodiverse conditions.";

interface SEOProps {
  /** Page-specific title. The site name is appended automatically. */
  title: string;
  /** Page-specific meta description. Falls back to the site-wide default. */
  description?: string;
  /**
   * Set true for pages that shouldn't be indexed (auth flows, the signed-in
   * dashboard, the admin portal) — content that's either duplicate-ish across
   * users or simply not meant for search results.
   */
  noindex?: boolean;
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Sets a distinct <title> + meta description (and matching Open Graph tags)
 * per routed page. Implemented as a tiny useEffect-driven component instead
 * of pulling in react-helmet-async: the app has no other head-management
 * dependency, there's no server-side rendering to coordinate with, and a
 * single BrowserRouter means direct DOM mutation on mount/update is simpler
 * than adopting a new library for a handful of tags. Every routed page
 * renders its own <SEO>, so the next page's effect always overwrites these
 * before the next paint — no need to restore defaults on unmount.
 */
export function SEO({ title, description = DEFAULT_DESCRIPTION, noindex = false }: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    document.title = fullTitle;
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, noindex]);

  return null;
}
