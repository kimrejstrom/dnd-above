import React from 'react';

interface Props {
  onClick: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  type?: string;
  extraClassName?: string;
  disabled?: boolean;
}

type ButtonProps = Props;

export const DEFAULT_BUTTON_STYLE =
  'text-md md:text-lg leading-none md:leading-none dark:hover:bg-dark-100 h-9 bg-light-200 hover:bg-yellow-100 dark:bg-dark-300 dark:text-light-100 px-0 md:px-1 custom-border custom-border-thin text-center';

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
