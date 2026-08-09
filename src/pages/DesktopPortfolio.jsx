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
      description="Native applications for documents that should never leave the machine - no upload, no account, no server. Rust cores with Angular front ends, shipped as a single binary per platform."
      categories={CATEGORIES}
      surface="desktop"
      emptyMessage="Desktop work is in progress."
    />
  );
};

export default DesktopPortfolio;
