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
      description="Native tools for work that should never leave the machine - no upload, no account, no server. A Rust and Tauri PDF utility, and a .NET tool that turns a hundred browser tabs into a queue that shrinks."
      categories={CATEGORIES}
      surface="desktop"
      emptyMessage="Desktop work is in progress."
    />
  );
};

export default DesktopPortfolio;
