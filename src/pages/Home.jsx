import React, { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useDocumentMeta from '../hooks/useDocumentMeta';
import useScrollRestore from '../hooks/useScrollRestore';
import { routeMeta } from '../data/routes';
import Hero from '../components/home/Hero';
import Story from '../components/home/story/Story';
import TryIt from '../components/home/tryit/TryIt';
import ProjectIndex from '../components/home/ProjectIndex';
import Experience from '../components/home/Experience';
import SealedFiles from '../components/home/SealedFiles';
import { Skills, Recognition } from '../components/home/Skills';
import Contact from '../components/home/Contact';

/**
 * The home page, as a case file.
 *
 * Order answers what an employer opens a portfolio to find out, fastest first:
 * who and what (the cover), the work told as four cases, three pieces of it to
 * try, then everything else as a scannable index, the roles, the client work
 * (sealed: sector and problem, never the client), the tools, the placings,
 * and how to get in touch. The header links straight to Work, Index,
 * Experience, Clients, Skills and Contact for anyone who would rather skip
 * the stories.
 */
const Home = () => {
  useDocumentMeta(routeMeta('/'));
  useScrollRestore('projectsScrollY');
  const location = useLocation();

  const scrollToId = useCallback((id, behavior = 'smooth') => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior, block: 'start' });
  }, []);

  // Arriving from another page with /#section (or the old `state.scrollTo`):
  // wait a frame so the sections have laid out, then go there.
  useEffect(() => {
    const target = location.state?.scrollTo || location.hash?.slice(1);
    if (!target) return undefined;
    const raf = requestAnimationFrame(() => scrollToId(target));
    return () => cancelAnimationFrame(raf);
  }, [location, scrollToId]);

  return (
    <div className="cf">
      <Hero onSeeWork={() => scrollToId('story')} />
      <Story />
      <TryIt />
      <ProjectIndex />
      <Experience />
      <SealedFiles />
      <Skills />
      <Recognition />
      <Contact />
    </div>
  );
};

export default Home;
