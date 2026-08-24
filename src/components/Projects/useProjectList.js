import { useCallback, useMemo, useState } from 'react';
import { projects as projectsData } from '../../data/projects';

/** How many projects to show before the visitor asks for more. */
export const INITIAL_COUNT = 6;

/**
 * The project list, shaped once for every renderer.
 *
 * Four modes present this list four different ways - a card grid, an audit
 * table, notebook entries, gallery plates - and none of them may shape the data
 * differently, or "18 projects" starts meaning four things. Filtering, ordering
 * and the visible window live here; the renderers only arrange what they are
 * handed.
 */
const projects = projectsData
  .filter((p) => p.featured)
  .map((p) => ({
    id: p.id,
    title: p.title,
    highlight: p.highlight || p.shortDescription || p.description || '',
    demoLink: p.liveUrl || p.demoLink || null,
    repoLink: p.githubUrl || p.repoLink || null,
    // Cap the chip list here rather than in the view, so the data decides which
    // four technologies are worth the space - in every renderer, identically.
    techLabels: (p.primaryTech || p.technologies || []).slice(0, 4),
    screenshot: p.screenshot || p.thumbnail || null,
    techIcons: p.techIcons || [],
    markdown: p.markdown || null,
    category: p.category || '',
    topPick: Boolean(p.topPick),
  }));

const useProjectList = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAll, setShowAll] = useState(false);

  const categories = useMemo(() => {
    const cats = projects.reduce((acc, p) => {
      if (p.category && !acc.includes(p.category)) acc.push(p.category);
      return acc;
    }, []);
    return ['All', ...cats];
  }, []);

  const filtered = useMemo(() => {
    const base =
      selectedCategory === 'All'
        ? projects
        : projects.filter((p) => p.category === selectedCategory);
    // Top picks lead, so the strongest work is what a visitor sees first.
    return [...base].sort((a, b) => Number(b.topPick) - Number(a.topPick));
  }, [selectedCategory]);

  // Changing category re-collapses the list: keeping it expanded would carry a
  // "view all" decision made about a different set of projects.
  const selectCategory = useCallback((category) => {
    setSelectedCategory(category);
    setShowAll(false);
  }, []);

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_COUNT);

  return {
    categories,
    selectedCategory,
    selectCategory,
    filtered,
    visible,
    hiddenCount: filtered.length - visible.length,
    showAll: () => setShowAll(true),
  };
};

export default useProjectList;
