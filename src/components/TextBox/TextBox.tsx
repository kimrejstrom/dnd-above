import React from 'react';

interface Props {
  title?: string;
  extraClassName?: string;
}

const TextBox: React.FC<Props> = ({
  title,
  extraClassName,
  children,
  ...rest
}) => {
  return (
    <div
      {...rest}
      className={`shadow dnd-body p-4 rounded bg-light-100 dark:bg-dark-100 ${
        extraClassName ? extraClassName : ''
      }`}
    >
      {title && <h2>{title}</h2>}
      {children}
    </div>
  );
};

export default TextBox;
