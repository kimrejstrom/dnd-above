import React from 'react';
import d20 from 'images/logo.svg';

export const Loading: React.FC = () => (
  <div className="fixed bg-dark-100 w-full h-full top-0 left-0 flex flex-col items-center justify-center">
    <img src={d20} className="w-12 px-2 py-2 shape-shadow" alt="logo" />
    <h1 className="text-center mb-6 text-light-100">DND Above</h1>
    <div className="spin spinner"></div>
  </div>
);
