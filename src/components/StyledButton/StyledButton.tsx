import React from 'react';

interface Props {
  onClick: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  type?: string;
  extraClassName?: string;
}

export const DEFAULT_BUTTON_STYLE =
  'text-lg dark-hover:bg-primary-dark h-8 leading-none bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 custom-border custom-border-thin text--center';

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
      className={`${extraClassName} ${DEFAULT_BUTTON_STYLE}`}
    >
      {children}
    </button>
  );
};

export default StyledButton;
