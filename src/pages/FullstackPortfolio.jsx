import React from 'react';
import CategoryPage from '../components/CategoryPage/CategoryPage';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { routeMeta } from '../data/routes';

const CATEGORIES = ['Full Stack', 'Frontend'];

const FullstackPortfolio = () => {
  useDocumentMeta(routeMeta('/fullstack'));

  return (
    <CategoryPage
      eyebrow="Deep dive"
      title="Full-stack web"
      description="Web apps with a server and a database behind them. Frontends in React, Next.js and Angular; backends in FastAPI, NestJS and Flask; data in PostgreSQL, Redis and Supabase."
      categories={CATEGORIES}
      surface="fullstack"
    />
  );
};

export default FullstackPortfolio;
