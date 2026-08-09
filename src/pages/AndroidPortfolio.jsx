import React from 'react';
import CategoryPage from '../components/CategoryPage/CategoryPage';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { routeMeta } from '../data/routes';

// 'Mobile' is the sanctioned category name in src/data/projects.js and the one
// projects.data.test.js validates against. A page filtering on 'Android' would
// silently show nothing the day a mobile project is added.
const CATEGORIES = ['Mobile'];

const AndroidPortfolio = () => {
  useDocumentMeta(routeMeta('/android'));

  return (
    <CategoryPage
      eyebrow="Deep dive"
      title="Android"
      description="Mobile work in Kotlin and Jetpack Compose."
      categories={CATEGORIES}
      surface="android"
      emptyMessage="Android work is in progress, and nothing here is far enough along to be worth your time yet. The full-stack and machine learning pages have the shipped projects."
    />
  );
};

export default AndroidPortfolio;
