import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { setThemeMode, ThemeMode } from 'features/theme/themeSlice';
import dudeDark from 'images/dude-dark.png';
import dudeLight from 'images/dude-light.png';

export const Header: React.FC = () => {
  const dispatch = useDispatch();

  // Get theme from Redux
  const theme = useSelector((state: RootState) => state.theme);
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

  return (
    <header className="border-b-2 border-tertiary-dark bg-yellow-100 dark:border-primary-light dark:bg-primary-dark h-20">
      <nav className="flex items-center justify-between flex-wrap p-5">
        <div className="flex items-center flex-shrink-0 text-primary-dark dark:text-primary-light mr-6">
          <Link
            to="/"
            className="flex items-center font-semibold text-2xl tracking-tighter leading-none"
          >
            <img
              className="mr-2 h-10"
              src={theme === ThemeMode.DARK ? dudeLight : dudeDark}
              alt="logo"
            />
            D&amp;D Above
          </Link>
        </div>
        <div className={`block flex flex-grow items-center w-auto`}>
          <div className="text-lg font-medium flex-grow">
            <NavLink
              exact
              to="/"
              className="block inline-block mt-0 hover:text-secondary-dark dark:text-yellow-100 dark-hover:text-yellow-400 mr-4"
            >
              Home
            </NavLink>
            <NavLink
              to="/create"
              className="block inline-block mt-0 hover:text-secondary-dark dark:text-yellow-100 dark-hover:text-yellow-400 mr-4"
            >
              Create
            </NavLink>
            <NavLink
              to="/about"
              className="block inline-block mt-0 hover:text-secondary-dark dark:text-yellow-100 dark-hover:text-yellow-400"
            >
              About
            </NavLink>
          </div>
          <div className="flex">
            {theme === ThemeMode.DARK ? (
              <>
                <button
                  className="inline-block"
                  title="Disable Dark Mode"
                  onClick={() => dispatch(setThemeMode(ThemeMode.LIGHT))}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    width="24"
                    height="24"
                    className="fill-current text-yellow-300"
                  >
                    <path d="M 8 0 A 8 8 0 0 0 8 16 A 8 8 0 0 0 8 0"></path>
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  className="inline-block"
                  onClick={() => dispatch(setThemeMode(ThemeMode.DARK))}
                  title="Enable Dark Mode"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    width="24"
                    height="24"
                    className="fill-current text-yellow-200"
                  >
                    <path
                      className="text-tertiary-dark fill-current"
                      d="M 8 0 A 8 8 0 0 0 8 16 A 8 8 0 0 0 8 0"
                    ></path>
                    <path d="M 8 2 A 6 6 0 0 0 8 14 A 8 14 0 0 0 13.196152422706632,11 A 6 6 0 0 1 8 2 z"></path>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
