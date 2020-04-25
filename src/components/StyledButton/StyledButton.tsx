import React from 'react';

interface Props {
  onClick: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  type?: string;
  extraClassName?: string;
}

export const DEFAULT_BUTTON_STYLE =
  'text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded';

const StyledButton: React.FC<Props> = ({
  onClick,
  extraClassName,
  type,
  children,
}) => {
  return (
    <button
      type={type as any}
      onClick={onClick}
      className={`${extraClassName} text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded`}
    >
      {children}
    </button>
  );
};

export default StyledButton;
