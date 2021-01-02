import React from 'react';

interface Props {
  onClick: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  type?: string;
  extraClassName?: string;
  disabled?: boolean;
}

type ButtonProps = Props;

export const DEFAULT_BUTTON_STYLE =
  'text-md sm:text-lg leading-none sm:leading-none dark:hover:bg-primary-dark h-9 bg-secondary-light hover:bg-primary-light dark:bg-tertiary-dark dark:text-primary-light px-0 sm:px-1 custom-border custom-border-thin text-center';

const StyledButton: React.FC<ButtonProps> = ({
  onClick,
  extraClassName,
  type,
  disabled,
  children,
}) => (
  <button
    disabled={disabled}
    type={type as any}
    onClick={onClick}
    className={`${DEFAULT_BUTTON_STYLE} ${extraClassName} ${
      disabled ? 'opacity-50' : ''
    }`}
  >
    {children}
  </button>
);

export default StyledButton;
