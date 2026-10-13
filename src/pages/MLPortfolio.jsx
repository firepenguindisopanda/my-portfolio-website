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
      description="Forecasting, fraud detection, customer segmentation, speech recognition and handwriting recognition. Each project is compared against a baseline, and each write-up lists its limitations."
      categories={CATEGORIES}
      surface="ml"
    />
  );
};

export default MLPortfolio;
