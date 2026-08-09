import { useEffect } from 'react';
import { SITE_URL } from '../data/routes';

const SUFFIX = 'Nicholas Smith';

const setMeta = (selector, attr, value) => {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
};

/**
 * Sets the title, description, canonical URL and social tags for a route.
 *
 * Every route previously shared the single <title> and <meta description> in
 * index.html, so /ml, /fullstack and /android were indistinguishable in search
 * results and in link previews.
 *
 * This only rewrites tags after JavaScript has run, which Googlebot handles and
 * every link-preview crawler does not. `scripts/generate-seo.mjs` writes the
 * same values into a real HTML file per route at build time; this hook keeps
 * client-side navigation in step with those files.
 *
 * @param {{title?: string, description?: string, path?: string, type?: string}} meta
 */
const useDocumentMeta = ({ title, description, path, type = 'website' } = {}) => {
  useEffect(() => {
    const previousTitle = document.title;

    if (title) {
      const full = title === SUFFIX ? title : `${title} - ${SUFFIX}`;
      document.title = full;
      setMeta('meta[property="og:title"]', 'content', full);
      setMeta('meta[name="twitter:title"]', 'content', full);
    }

    if (description) {
      setMeta('meta[name="description"]', 'content', description);
      setMeta('meta[property="og:description"]', 'content', description);
      setMeta('meta[name="twitter:description"]', 'content', description);
    }

    if (path) {
      const url = `${SITE_URL}${path}`;
      setMeta('link[rel="canonical"]', 'href', url);
      setMeta('meta[property="og:url"]', 'content', url);
      setMeta('meta[name="twitter:url"]', 'content', url);
    }

    // A case study is an article, not the site's front page. Sharing one on a
    // platform that reads og:type gets it filed as writing rather than as a
    // duplicate of the home page.
    setMeta('meta[property="og:type"]', 'content', type);

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, path, type]);
};

export default useDocumentMeta;
