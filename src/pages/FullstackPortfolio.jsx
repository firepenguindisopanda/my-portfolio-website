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
      description="Systems with a server, a database and something at stake. React, Next.js and Angular on the front; FastAPI, NestJS and Flask behind them; PostgreSQL, Redis and Supabase underneath."
      categories={CATEGORIES}
      surface="fullstack"
    />
  );
};

export default FullstackPortfolio;
