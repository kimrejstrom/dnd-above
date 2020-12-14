import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { setThemeMode, ThemeMode } from 'features/theme/themeSlice';
import dudeDark from 'images/dude-dark.png';
import dudeLight from 'images/dude-light.png';
import { getCookie } from 'utils/cookie';
import { setSelectedCharacter } from 'features/character/selectedCharacterSlice';

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const allSources = getCookie('allSources') === 'true';
  const characterList = useSelector(
    (state: RootState) => state.characterList,
  ).list.filter(character => {
    if (!allSources) {
      return !character.allSources;
    }
    return true;
  });
  const selectedCharacterId = useSelector(
    (state: RootState) => state.selectedCharacter,
  );
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
    <header className="border-b-2 border-tertiary-dark bg-yellow-100 dark:border-primary-light dark:bg-primary-dark h-24 sm:h-20">
      <nav className="flex items-center justify-between flex-wrap px-5 py-3 sm:py-5">
        <div className="flex items-center flex-shrink-0 text-primary-dark dark:text-primary-light mr-1 md:mr-6">
          <Link
            to="/"
            className="flex items-center text-2xl tracking-tighter leading-none"
          >
            <img
              className="mr-2 h-10"
              src={theme === ThemeMode.DARK ? dudeLight : dudeDark}
              alt="logo"
            />
            <div>D&amp;D Above</div>
            {allSources && (
              <sup className="text-yellow-500 text-sm ml-1">Adv</sup>
            )}
          </Link>
        </div>
        <div className={`flex flex-grow items-center w-auto`}>
          <div className="text-lg font-medium flex-grow">
            <NavLink
              exact
              to="/"
              className="inline-mt-0 hover:text-secondary-dark dark:text-yellow-100 dark-hover:text-yellow-400 mr-4"
            >
              Home
            </NavLink>
            <NavLink
              to="/create"
              className="inline-block mt-0 hover:text-secondary-dark dark:text-yellow-100 dark-hover:text-yellow-400 mr-4"
            >
              Create
            </NavLink>
            <li className="relative py-2 rounded-full mb-0 nav-group-link cursor-pointer inline-block mt-0 hover:text-secondary-dark dark:text-yellow-100 dark-hover:text-yellow-400 mr-4">
              Character
              <ul className="absolute z-50 left-0 top-0 mt-10 p-2 rounded-lg shadow-lg bg-white nav-group hidden">
                <svg
                  className="block fill-current text-white w-4 h-4 absolute left-0 top-0 ml-3 -mt-3 z-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                </svg>
                {characterList.map((character, i) => (
                  <li
                    onClick={() => dispatch(setSelectedCharacter(character.id))}
                    key={i}
                    className={`${
                      character.id === selectedCharacterId
                        ? 'text-gray-900'
                        : 'text-gray-600'
                    } p-1 whitespace-no-wrap rounded-full text-sm md:text-base hover:text-gray-800 hover:bg-gray-100`}
                  >
                    <div className="px-2 py-1">
                      {character.descriptionData.name}
                      {character.id === selectedCharacterId && ' ✓'}
                    </div>
                  </li>
                ))}
              </ul>
            </li>
            <NavLink
              to="/about"
              className="inline-block mt-0 hover:text-secondary-dark dark:text-yellow-100 dark-hover:text-yellow-400"
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
