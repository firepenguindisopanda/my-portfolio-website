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
      emptyMessage="My Android projects are still in progress, so there is nothing to show here yet. The full-stack and machine learning pages have finished projects."
    />
  );
};

export default AndroidPortfolio;
