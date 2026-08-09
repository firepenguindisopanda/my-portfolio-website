import React from 'react';
import CategoryPage from '../components/CategoryPage/CategoryPage';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { routeMeta } from '../data/routes';

// AI/ML joins Data Science here: a visitor looking for machine learning work
// does not distinguish between the two, and splitting them left the RAG and
// chatbot projects with no deep-dive page at all.
const CATEGORIES = ['Data Science', 'AI/ML'];

const MLPortfolio = () => {
  useDocumentMeta(routeMeta('/ml'));

  return (
    <CategoryPage
      eyebrow="Deep dive"
      title="Machine learning & data science"
      description="Forecasting, fraud detection, customer segmentation and speech recognition. Each one is scored against a baseline worth beating, and reports what it could not do as plainly as what it could."
      categories={CATEGORIES}
      surface="ml"
    />
  );
};

export default MLPortfolio;
