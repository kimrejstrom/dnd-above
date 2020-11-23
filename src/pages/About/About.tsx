import React from 'react';
import { useSelector } from 'react-redux';
import dudeDark from 'images/dude-dark.png';
import dudeLight from 'images/dude-light.png';
import { useServiceWorker, IServiceWorkerContext } from 'useServiceWorker';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import { AuthButton } from 'app/Auth';

export const About: React.FC = () => {
  const { updateAssets } = useServiceWorker() as IServiceWorkerContext;
  // Get theme from Redux
  const theme = useSelector((state: RootState) => state.theme);
  return (
    <div className="container mx-auto mt-8 max-w-xs pt-4">
      <div className="flex justify-center items-center flex-shrink-0 text-primary-dark dark:text-primary-light">
        <div className="flex items-center text-2xl tracking-tighter leading-none">
          <img
            src={theme === ThemeMode.DARK ? dudeLight : dudeDark}
            className="mr-2 h-10"
            alt="logo"
          />
          <div>D&amp;D Above</div>
        </div>
      </div>
      <div className="text-center font-sans">
        <p className="mx-auto w-full m-6">
          Welcome to D&amp;D Above. The ultimate D&D Character Builder and
          Character Sheet made using React and Typescript. See{' '}
          <a
            href="https://github.com/kimrejstrom/dnd-above"
            target="_blank"
            className="underline hover:text-yellow-200"
            rel="noopener noreferrer"
          >
            Github
          </a>{' '}
          for project details.
        </p>
        <p className="mx-4">
          <AuthButton />
        </p>
        <p>
          It is a fully fledged Progressive Web App (PWA) and can thus be added
          to your phone's homescreen as a fully functioning offline app.
        </p>
        <button className="block mx-auto mt-8" onClick={updateAssets}>
          <svg
            className="inline-block fill-current h-4 w-4 dark:text-white mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path d="M6 18.7V21a1 1 0 0 1-2 0v-5a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2H7.1A7 7 0 0 0 19 12a1 1 0 1 1 2 0 9 9 0 0 1-15 6.7zM18 5.3V3a1 1 0 0 1 2 0v5a1 1 0 0 1-1 1h-5a1 1 0 0 1 0-2h2.9A7 7 0 0 0 5 12a1 1 0 1 1-2 0 9 9 0 0 1 15-6.7z" />
          </svg>
          Check for updates
        </button>
        <div className="w-full mb-12 mt-24 font-sans text-sm">
          <div className="flex justify-around">
            <a
              href="https://github.com/kimrejstrom/dnd-above"
              target="_blank"
              className="flex items-center underline hover:text-yellow-200"
              rel="noopener noreferrer"
            >
              <svg
                width="256"
                height="256"
                className="inline-block h-4 w-4 fill-current text-white mr-2"
                viewBox="0 0 16 16"
                version="1.1"
                aria-hidden="true"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>{' '}
              Project
            </a>
            <a
              href="https://github.com/kimrejstrom/dnd-above/issues/new/choose"
              target="_blank"
              className="underline hover:text-yellow-200"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="inline-block h-4 w-4 fill-current text-white mr-2"
                width="24"
                height="24"
              >
                <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
              </svg>
              Report a problem
            </a>
          </div>
          <p className="text-xs dark:text-white opacity-50 mt-2">
            © 2020 Kim Rejström
          </p>
        </div>
      </div>
    </div>
  );
};
