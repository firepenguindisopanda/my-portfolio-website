import React from 'react';
import CategoryPage from '../components/CategoryPage/CategoryPage';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { routeMeta } from '../data/routes';

const CATEGORIES = ['Desktop Tools'];

const DesktopPortfolio = () => {
  useDocumentMeta(routeMeta('/desktop'));

  return (
    <CategoryPage
      eyebrow="Deep dive"
      title="Desktop tools"
      description="Desktop apps that run entirely on your own machine, with no uploads, accounts or server: a PDF utility in Rust and Tauri, and a .NET app that turns a hundred browser tabs into a reading queue."
      categories={CATEGORIES}
      surface="desktop"
      emptyMessage="Desktop work is in progress."
    />
  );
};

export default DesktopPortfolio;
