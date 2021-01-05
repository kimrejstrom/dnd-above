import React from 'react';

interface Props {
  title?: string;
}

const TextBox: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="shadow dnd-body mx-1 my-2 p-4 rounded bg-light-300 dark:bg-dark-100">
      {title && <h2>{title}</h2>}
      {children}
    </div>
  );
};

export default TextBox;
