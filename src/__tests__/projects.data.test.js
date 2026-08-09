import fs from 'node:fs';
import path from 'node:path';
import { projects } from '../data/projects';
import { staticRoutes, routeMeta } from '../data/routes';

describe('Projects Data', () => {
  it('should have valid project entries', () => {
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
  });

  it('should have required fields for each project', () => {
    projects.forEach((project) => {
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('title');
      expect(typeof project.id).toBe('string');
      expect(typeof project.title).toBe('string');
      expect(project.id.length).toBeGreaterThan(0);
      expect(project.title.length).toBeGreaterThan(0);
    });
  });

  it('should have unique project IDs', () => {
    const ids = projects.map(p => p.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });

  it('should have valid technology arrays', () => {
    const projectsWithTech = projects.filter(p => p.technologies);
    projectsWithTech.forEach((project) => {
      expect(Array.isArray(project.technologies)).toBe(true);
      project.technologies.forEach(tech => {
        expect(typeof tech).toBe('string');
      });
    });
  });

  it('should have valid URLs when provided', () => {
    const urlPattern = /^https?:\/\/.+/;
    
    const projectsWithGithub = projects.filter(p => p.githubUrl);
    projectsWithGithub.forEach((project) => {
      expect(project.githubUrl).toMatch(urlPattern);
    });
    
    const projectsWithLive = projects.filter(p => p.liveUrl);
    projectsWithLive.forEach((project) => {
      expect(project.liveUrl).toMatch(urlPattern);
    });
  });

  it('should have valid markdown paths when provided', () => {
    const projectsWithMarkdown = projects.filter(p => p.markdown);
    projectsWithMarkdown.forEach((project) => {
      expect(project.markdown).toMatch(/^\/markdowns\/.+\.md$/);
    });
  });

  it('should have valid categories', () => {
    const validCategories = ['Full Stack', 'AI/ML', 'Mobile', 'Frontend', 'Backend', 'Data Science', 'Desktop Tools'];
    
    const projectsWithCategory = projects.filter(p => p.category);
    projectsWithCategory.forEach((project) => {
      expect(validCategories).toContain(project.category);
    });
  });
});

describe('Projects Data Integrity', () => {
  it('should not have empty strings for required fields', () => {
    projects.forEach((project) => {
      expect(project.id.trim()).not.toBe('');
      expect(project.title.trim()).not.toBe('');
    });
  });

  it('should have description or shortDescription', () => {
    projects.forEach((project) => {
      const hasDescription = project.description || project.shortDescription;
      expect(hasDescription).toBeTruthy();
    });
  });
});

/*
 * These guard the data the build-time SEO generator reads. A project whose
 * `markdown` path is wrong renders an empty case study, and scripts/generate-seo.mjs
 * still emits a sitemap entry and a link-preview card pointing at it.
 */
describe('Case study routing', () => {
  // Collected rather than asserted per-project, so a failure names every broken
  // entry at once instead of stopping at the first.
  it('points every markdown path at a file that exists', () => {
    const withMarkdown = projects.filter((p) => p.markdown);
    expect(withMarkdown.length).toBeGreaterThan(0);

    const missing = withMarkdown
      .filter((p) => !fs.existsSync(path.join(process.cwd(), 'public', p.markdown)))
      .map((p) => `${p.id} -> ${p.markdown}`);

    expect(missing).toEqual([]);
  });

  it('gives every case study the description the link preview will use', () => {
    const undescribed = projects
      .filter((p) => p.markdown && !(p.shortDescription || p.highlight))
      .map((p) => p.id);

    expect(undescribed).toEqual([]);
  });

  it('never carries an empty evidence line', () => {
    // The device is deliberately absent on projects without a verification
    // mechanism. An empty string would render the rule and label with no claim.
    const blank = projects
      .filter((p) => 'evidence' in p)
      .filter((p) => typeof p.evidence !== 'string' || p.evidence.trim().length < 20)
      .map((p) => p.id);

    expect(blank).toEqual([]);
  });
});

describe('Route metadata', () => {
  it('registers a unique title and description for every static route', () => {
    const paths = staticRoutes.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);

    staticRoutes.forEach((route) => {
      expect(route.title?.trim()).toBeTruthy();
      expect(route.description?.trim()).toBeTruthy();
      expect(route.path.startsWith('/')).toBe(true);
    });
  });

  it('throws rather than shipping a blank title for an unregistered route', () => {
    expect(() => routeMeta('/not-a-route')).toThrow();
  });
});
