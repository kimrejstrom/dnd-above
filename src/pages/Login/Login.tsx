import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import StyledButton from 'components/StyledButton/StyledButton';
import { useAuth } from 'utils/auth';
import beholderDark from 'images/beholder-dark.png';
import beholderLight from 'images/beholder-light.png';
import { useDispatch, useSelector } from 'react-redux';
import { getCharacterList } from 'features/character/characterListSlice';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import { useServiceWorker, IServiceWorkerContext } from 'useServiceWorker';

export const Login = () => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const auth = useAuth();
  const theme = useSelector((state: RootState) => state.theme);
  const { updateAssets } = useServiceWorker() as IServiceWorkerContext;

  const { from } = (location.state as any) || { from: { pathname: '/' } };
  const login = () => {
    auth?.authenticate(() => {
      dispatch(getCharacterList());
      history.replace(from);
    });
  };

  return (
    <div
      className="mx-auto mt-8 pt-4 flex flex-col items-center justify-center"
      style={{ maxWidth: '62rem' }}
    >
      <div className="p-10 md:p-20 custom-border bg-tertiary-light dark:bg-tertiary-dark flex flex-col items-center justify-center">
        <img
          src={theme === ThemeMode.DARK ? beholderLight : beholderDark}
          className="h-40 w-40 px-2 py-2 shape-shadow"
          alt="logo"
        />
        <div className="text-center mb-4">
          <h1 className="leading-tight">D&amp;D Above</h1>
          <h3>Play with True advantage</h3>
          <div
            className="my-3 p-2 border border-gray-300 dark:border-yellow-900 rounded-md w-full dark:text-yellow-100 dark:bg-yellow-800 bg-yellow-100 leading-none flex justify-center items-center"
            role="alert"
          >
            <span className="flex rounded-full text-yellow-100 bg-primary-dark px-2 py-1 text-xs font-bold mr-3">
              !
            </span>
            <div>You must be logged in to use D&D Above.</div>
          </div>
        </div>
        <div className="flex">
          <StyledButton extraClassName="mr-2" onClick={login}>
            Log in
          </StyledButton>
          <StyledButton onClick={login}>Sign Up</StyledButton>
        </div>

        <div className="text-center max-w-sm dnd-body">
          <p className="mx-auto w-full m-6">
            D&D Above is the ultimate D&D Character Builder and Character Sheet.
            <br />
            <br />
            Create, build and play your D&D characters anywhere, anytime.
          </p>
          <p>
            Made as a Progressive Web App (PWA) you can easily add it to your
            phone's homescreen as a fully functioning offline app.
            <br />
            <br />
            See{' '}
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
        </div>
        <StyledButton extraClassName="mt-4 h-10" onClick={updateAssets}>
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
        </StyledButton>
      </div>
    </div>
  );
};
