import React, { lazy, Suspense } from 'react';
import { importMDX } from 'mdx.macro';
import Loader from 'components/Loader/Loader';

const Content = lazy(() => importMDX('./Info.mdx'));

export const Info: React.FC = () => (
  <div className="mt-4 pt-4">
    <div className="mdx dnd-body mb-6 rounded shadow bg-light-300 dark:bg-dark-300 p-6">
      <Suspense fallback={<Loader />}>
        <Content />
      </Suspense>
    </div>
  </div>
);
