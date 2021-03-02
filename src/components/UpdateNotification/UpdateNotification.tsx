import React from 'react';
import {
  useServiceWorker,
  IServiceWorkerContext,
} from 'utils/useServiceWorker';
import Button from 'components/Button/Button';

export const UpdateNotification: React.FC = () => {
  // Check for new service worker
  const {
    isUpdateAvailable,
    updateAssets,
  } = useServiceWorker() as IServiceWorkerContext;
  return isUpdateAvailable ? (
    <div className="fixed w-full bottom-14 sm:bottom-0 z-50">
      <div
        className="p-2 bg-yellow-800 text-yellow-100 leading-none flex justify-center items-center"
        role="alert"
      >
        <span className="flex rounded-full bg-dark-100 px-2 py-1 text-xs font-bold mr-3">
          New
        </span>
        <div>
          A new version is available
          <Button
            className="hover:bg-dark-100 bg-dark-200 text-yellow-100 py-1 px-2 border border-yellow-600 rounded ml-4"
            onClick={updateAssets}
            title="Update now"
          />
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};
