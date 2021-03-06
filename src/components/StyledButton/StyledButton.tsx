import React from 'react';

interface Props {
  onClick?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  type?: string;
  extraClassName?: string;
  disabled?: boolean;
}

type ButtonProps = Props;

export const DEFAULT_BUTTON_STYLE =
  'dnd-header text-md md:text-lg leading-none md:leading-none dark:hover:bg-highdark-200 bg-highlight-100 hover:bg-highlight-200 dark:bg-highdark-100 dark:text-light-100 px-0 md:px-1 h-10 custom-border-xs xl:px-3 text-center';

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
