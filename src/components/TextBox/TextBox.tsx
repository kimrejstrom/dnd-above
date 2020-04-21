import React from 'react';

interface Props {
  title?: string;
}

const TextBox: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="shadow dnd-body mx-1 my-2 p-4 rounded bg-tertiary-light dark:bg-primary-dark">
      {title && <h2>{title}</h2>}
      {children}
    </div>
  );
};

export default TextBox;
