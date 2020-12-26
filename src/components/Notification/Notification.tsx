import React from 'react';

export enum NotificationType {
  Error = 'Error',
  Warning = 'Warning',
  Info = 'Info',
  Success = 'Success',
}

interface Props {
  type: NotificationType;
}

export const Warning = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    width="16"
    height="16"
    fill="currentColor"
    className="fill-current"
  >
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

export const Info = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    width="16"
    height="16"
    fill="currentColor"
    className="fill-current"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
      clipRule="evenodd"
    />
  </svg>
);

export const Error = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    width="16"
    height="16"
    fill="currentColor"
    className="fill-current"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

export const Success = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    width="16"
    height="16"
    fill="currentColor"
    className="fill-current"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

const Notification: React.FC<Props> = ({ type, children }) => {
  const notificationCls = `p-3 rounded-md w-full dark:text-yellow-100 dark:bg-yellow-800 bg-secondary-light leading-none flex items-center`;
  const notificationIconCls = `flex rounded-full text-yellow-100 px-2 py-2 text-xs font-bold mr-3`;
  switch (type) {
    case NotificationType.Error:
      return (
        <div className={notificationCls} role="alert">
          <span className={`${notificationIconCls} bg-red-700`}>
            <Error />
          </span>
          <div>{children}</div>
        </div>
      );

    case NotificationType.Warning:
      return (
        <div className={notificationCls} role="alert">
          <span className={`${notificationIconCls} bg-yellow-700`}>
            <Warning />
          </span>
          <div>{children}</div>
        </div>
      );

    case NotificationType.Info:
      return (
        <div className={notificationCls} role="alert">
          <span className={`${notificationIconCls} bg-blue-700`}>
            <Info />
          </span>
          <div>{children}</div>
        </div>
      );

    case NotificationType.Success:
      return (
        <div className={notificationCls} role="alert">
          <span className={`${notificationIconCls} bg-green-700`}>
            <Success />
          </span>
          <div>{children}</div>
        </div>
      );

    default:
      return <></>;
  }
};

export default Notification;
