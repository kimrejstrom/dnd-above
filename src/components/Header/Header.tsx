import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { setThemeMode, ThemeMode } from 'features/theme/themeSlice';

export const Header: React.FC = () => {
  const dispatch = useDispatch();

  // Open mobile menu open
  const [open, setOpen] = useState(false);

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
      <nav className="flex items-center justify-between flex-wrap p-6">
        <div className="flex items-center flex-shrink-0 text-primary-dark dark:text-primary-light mr-6">
          <Link
            to="/"
            className="font-semibold text-3xl tracking-tighter leading-none"
          >
            D&amp;D Above
          </Link>
        </div>
        <div className="block lg:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center px-3 py-2 border rounded text-yellow-400 border-yellow-400 hover:text-white hover:border-white"
          >
            <svg
              className="fill-current h-3 w-3"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>
        <div
          className={`${
            open ? 'block' : 'hidden'
          } w-full block flex-grow lg:flex lg:items-center lg:w-auto`}
        >
          <div className="text-lg font-medium lg:flex-grow">
            <Link
              to="/"
              className="block mt-4 lg:inline-block lg:mt-0 hover:text-secondary-dark dark:text-yellow-100 dark-hover:text-yellow-400 mr-4"
            >
              Home
            </Link>
            <Link
              to="/demo"
              className="block mt-4 lg:inline-block lg:mt-0 hover:text-secondary-dark dark:text-yellow-100 dark-hover:text-yellow-400 mr-4"
            >
              Demo
            </Link>
            <Link
              to="/about"
              className="block mt-4 lg:inline-block lg:mt-0 hover:text-secondary-dark dark:text-yellow-100 dark-hover:text-yellow-400"
            >
              About
            </Link>
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
