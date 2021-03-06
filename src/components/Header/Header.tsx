import React, { useEffect, useState } from 'react';
import { NavLink, Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { setThemeMode, ThemeMode } from 'features/theme/themeSlice';
import logoLight from 'images/header-logo-light.png';
import logoDark from 'images/header-logo-dark.png';
import { getCookie } from 'utils/cookie';
import { togglePanel } from 'features/settings/settingsSlice';
import { useAuth } from 'utils/auth';
import Button from 'components/Button/Button';
import {
  useServiceWorker,
  IServiceWorkerContext,
} from 'utils/useServiceWorker';
import { persistor } from 'app/store';

const navBtnCls =
  'w-full text-left block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900';

export const AuthButton = () => {
  const history = useHistory();
  const auth = useAuth();

  return auth?.user ? (
    <Button
      className={navBtnCls}
      onClick={() => {
        auth.signout(async () => {
          await persistor.purge();
          history.push('/');
        });
      }}
      title="Sign Out"
    />
  ) : (
    <Button
      className={navBtnCls}
      onClick={() => {
        auth?.authenticate(() => history.push('/'));
      }}
      title="Log In"
    />
  );
};

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const { updateAssets } = useServiceWorker() as IServiceWorkerContext;
  const allSources = getCookie('allSources') === 'true';
  const auth = useAuth();
  // Get theme from Redux
  const theme = useSelector((state: RootState) => state.theme);
  const { loading } = useSelector((state: RootState) => state.characterList);
  // Support for OS level color preference
  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches &&
      theme === ThemeMode.DEFAULT
    ) {
      dispatch(setThemeMode(ThemeMode.DARK));
    }
  });
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);

  const connectionActive = loading !== 'error';

  const MobileProfileMenu = () => (
    <div className="bg-gray-100 rounded p-1 font-sans divide-y divide-gray-200">
      <div className="p-1">
        <strong className="text-gray-900">
          {auth?.user ? auth.user.user_metadata.full_name : 'Not logged in'}
        </strong>
        <br />
        <span className="text-sm text-gray-500">
          {auth?.user ? auth.user.email : ''}
        </span>
      </div>
      {auth?.user && (
        <div className="p-1">
          <NavLink
            to="/settings"
            className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            User Settings
          </NavLink>
        </div>
      )}
      <div className="p-1">
        <AuthButton />
      </div>
      <div className="p-1">
        <Button
          className={navBtnCls}
          onClick={updateAssets}
          title="Check for updates"
        />
      </div>
    </div>
  );

  const ProfileMenu = () => (
    <li className="nav-item font-sans">
      <div className="lg:mr-3">
        <div className="relative inline-block text-left">
          <div>
            <button
              type="button"
              className="inline-flex justify-center w-full p-1 rounded-full shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-yellow-500"
              aria-haspopup="true"
              aria-expanded="true"
              onClick={() => setDropDownOpen(!dropDownOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                width="24"
                height="24"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {dropDownOpen && (
            <div
              className="z-50 origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <div className="p-2">
                <strong className="text-gray-900">
                  {auth?.user
                    ? auth.user.user_metadata.full_name
                    : 'Not logged in'}
                </strong>
                <br />
                <span className="text-sm text-gray-500">
                  {auth?.user ? auth.user.email : ''}
                </span>
              </div>
              {auth?.user && (
                <div className="p-2">
                  <NavLink
                    to="/settings"
                    className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    User Settings
                  </NavLink>
                </div>
              )}
              <div className="p-2">
                <AuthButton />
              </div>
              <div className="p-2">
                <Button
                  className={navBtnCls}
                  onClick={updateAssets}
                  title="Check for updates"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );

  return (
    <header className="bg-light-100 dark:bg-dark-100">
      <nav className="z-50 md:z-auto border-b-2 border-dark-300 dark:border-light-100 bg-light-200 dark:bg-dark-200 fixed w-full md:relative flex flex-wrap items-center justify-between p-2 navbar-expand-lg text-dark-100 dark:text-light-100 shadow-lg">
        <div className="px-4 w-full mx-auto flex flex-wrap items-center justify-between">
          <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
            <div className="flex items-center flex-shrink-0 text-dark-100 dark:text-light-100 mr-1 md:mr-6">
              <Link
                to="/"
                className="flex items-center text-2xl tracking-tighter leading-none"
              >
                <img
                  className="mr-1 h-10"
                  src={theme === ThemeMode.DARK ? logoLight : logoDark}
                  alt="logo"
                />
                {allSources && (
                  <sup className="text-yellow-500 text-sm">Adv</sup>
                )}
              </Link>
            </div>
            <button
              className="block lg:hidden cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent outline-none focus:outline-none"
              type="button"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              &#9776;
            </button>
          </div>
          <div
            className={
              'lg:flex lg:flex-grow items-center justify-center ' +
              (navbarOpen ? 'flex w-full sm:w-48' : 'hidden')
            }
          >
            <ul className="flex flex-col lg:flex-row w-full lg:w-auto justify-center list-none mt-2 lg:mt-0 lg:ml-auto lg:items-center divide-y divide-gray-200 lg:divide-opacity-0">
              <li className="p-2 lg:p-0">
                <NavLink
                  exact
                  to="/"
                  className="inline-block mt-0 hover:text-secondaryfw-100 dark:text-yellow-100 dark:hover:text-yellow-400 lg:mr-4"
                >
                  Home
                </NavLink>
              </li>
              <li className="p-2 lg:p-0">
                <NavLink
                  to="/characters"
                  className="inline-block mt-0 hover:text-secondaryfw-100 dark:text-yellow-100 dark:hover:text-yellow-400 lg:mr-4"
                >
                  Characters
                </NavLink>
              </li>
              <li className="p-2 lg:p-0">
                <NavLink
                  to="/create"
                  className="inline-block mt-0 hover:text-dark-200 dark:text-yellow-100 dark:hover:text-yellow-400 lg:mr-4"
                >
                  Create
                </NavLink>
              </li>
              <li className="p-2 lg:p-0">
                <NavLink
                  to="/books"
                  className="inline-block mt-0 hover:text-dark-200 dark:text-yellow-100 dark:hover:text-yellow-400 lg:mr-4"
                >
                  Books
                </NavLink>
              </li>
              {!navbarOpen ? <ProfileMenu /> : <MobileProfileMenu />}

              <li className="p-2 lg:p-1">
                <div className="flex">
                  {theme === ThemeMode.DARK ? (
                    <>
                      <div className="block lg:hidden mr-2">
                        Toggle Light Mode
                      </div>
                      <button
                        className="inline-block"
                        title="Disable Dark Mode"
                        onClick={() => dispatch(setThemeMode(ThemeMode.LIGHT))}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 16 16"
                          width="20"
                          height="20"
                          className="fill-current text-yellow-300"
                        >
                          <path d="M 8 0 A 8 8 0 0 0 8 16 A 8 8 0 0 0 8 0"></path>
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="block lg:hidden mr-2">
                        Toggle Dark Mode
                      </div>
                      <button
                        className="inline-block"
                        onClick={() => dispatch(setThemeMode(ThemeMode.DARK))}
                        title="Enable Dark Mode"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 16 16"
                          width="20"
                          height="20"
                          className="fill-current text-yellow-200"
                        >
                          <path
                            className="text-dark-300 fill-current"
                            d="M 8 0 A 8 8 0 0 0 8 16 A 8 8 0 0 0 8 0"
                          ></path>
                          <path d="M 8 2 A 6 6 0 0 0 8 14 A 8 14 0 0 0 13.196152422706632,11 A 6 6 0 0 1 8 2 z"></path>
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </li>
            </ul>
          </div>
          <div className="flex items-center">
            <ul className="flex flex-col lg:flex-row list-none lg:ml-auto items-center">
              <li className="nav-item">
                <button
                  className="hidden lg:block cursor-pointer text-xl px-1 py-1 leading-none border border-solid border-transparent rounded bg-transparent outline-none focus:outline-none"
                  onClick={() => dispatch(togglePanel())}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    width="24"
                    height="24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div
          className={`${
            connectionActive ? 'bg-green-700' : 'bg-red-800'
          } absolute top-2 right-2 rounded-full w-2 h-2`}
        ></div>
      </nav>
    </header>
  );
};
