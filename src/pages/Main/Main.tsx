import React from 'react';
import shield from 'images/shield.svg';
import { Roller } from 'pages/Roller/Roller';
import { Spells } from 'pages/Spells/Spells';
import { random } from 'lodash/fp';
import hpLight from 'images/hp-light.png';
import acLight from 'images/ac-light.png';
import hpDark from 'images/hp-dark.png';
import acDark from 'images/ac-dark.png';
import initiativeDark from 'images/initiative-dark.png';
import initiativeLight from 'images/initiative-light.png';
import alignmentDark from 'images/alignment-dark.png';
import alignmentLight from 'images/alignment-light.png';
import nameDark from 'images/name-dark.png';
import nameLight from 'images/name-light.png';
import proficiencyDark from 'images/proficiency-dark.png';
import proficiencyLight from 'images/proficiency-light.png';
import inspirationDark from 'images/inspiration-dark.png';
import inspirationLight from 'images/inspiration-light.png';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';

interface Props {}

const CHARACTER_STATS = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

const CHARACTER_SKILLS = {
  athletics: 'str',
  acrobatics: 'dex',
  'sleight of hand': 'dex',
  stealth: 'dex',
  arcana: 'int',
  history: 'int',
  investigation: 'int',
  nature: 'int',
  religion: 'int',
  'animal handling': 'wis',
  insight: 'wis',
  medicine: 'wis',
  perception: 'wis',
  survival: 'wis',
  deception: 'cha',
  intimidation: 'cha',
  performance: 'cha',
  persuasion: 'cha',
};

const CHARACTER_SENSES = {
  B: 'blindsight',
  D: 'darkvision',
  SD: 'superior darkvision',
  T: 'tremorsense',
  U: 'truesight',
};

const PASSIVE_SENSES = {
  'passive perception': 'wis',
  'passive intelligence': 'int',
  'passive insight': 'wis',
};

const getLevel = () => random(1, 20);

const getSpeed = (race: string) => random(25, 50);

const getAbilityMod = (abilityScore: number) =>
  Math.floor((abilityScore - 10) / 2);

const getAbilityScore = (stat: string) => {
  // TODO: get by stat
  return random(8, 20);
};

const getProficiencyBonus = (level: number) => {
  if (!level) return 2;
  return Math.ceil(level / 4) + 1;
};

const isProficient = (stat: string) => random(0, 1);

export const Main: React.FC<Props> = () => {
  const LEVEL = getLevel();
  const theme = useSelector((state: RootState) => state.theme);
  return (
    <div className="flex">
      {/* Sidebar / channel list */}
      <div className="bg-tertiary-dark flex-none w-24 p-6 hidden md:block font-sans">
        <div className="cursor-pointer mb-4">
          <div className="bg-white h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
            <img className="p-2" src={shield} alt="" />
          </div>
          <div className="text-center text-white opacity-50 text-sm">
            &#8984;1
          </div>
        </div>
        <div className="cursor-pointer mb-4">
          <div className="bg-white opacity-25 h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
            L
          </div>
          <div className="text-center text-white opacity-50 text-sm">
            &#8984;2
          </div>
        </div>
        <div className="cursor-pointer">
          <div className="bg-white opacity-25 h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
            <svg
              className="fill-current h-10 w-10 block"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M16 10c0 .553-.048 1-.601 1H11v4.399c0 .552-.447.601-1 .601-.553 0-1-.049-1-.601V11H4.601C4.049 11 4 10.553 4 10c0-.553.049-1 .601-1H9V4.601C9 4.048 9.447 4 10 4c.553 0 1 .048 1 .601V9h4.399c.553 0 .601.447.601 1z" />
            </svg>
          </div>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-auto flex flex-wrap bg-yellow-100 dark:bg-primary-dark p-4 h-full">
        <div className="w-full flex flex-wrap">
          {/* Name */}
          <div
            className="bg-contain bg-left bg-no-repeat mb-2"
            style={{
              width: '30rem',
              height: '7rem',
              backgroundImage: `url(${
                theme === ThemeMode.DARK ? nameLight : nameDark
              })`,
            }}
          >
            <svg viewBox="-65 31 500 100">
              <path
                d="M0,98 C0,98 85,83.5 177,83.5 C269,83.5 354,98 353.902495,98 L0,98 Z"
                id="curve"
                fill="transparent"
              ></path>
              <text width="500" className="fill-current text-3xl">
                <textPath textAnchor="middle" startOffset="25%" href="#curve">
                  Moe Glee The Minionmancer
                </textPath>
              </text>
            </svg>
          </div>
          {/* Alignment */}
          <div
            className="mx-4 relative bg-contain bg-center bg-no-repeat"
            style={{
              width: '24rem',
              height: '7rem',
              backgroundImage: `url(${
                theme === ThemeMode.DARK ? alignmentLight : alignmentDark
              })`,
            }}
          >
            <p
              className="text-3xl absolute inset-0 text-center"
              style={{
                top: '1.75rem',
                left: '-6rem',
              }}
            >
              {getLevel()}
            </p>
            <p
              className="text-3xl absolute inset-0 text-center"
              style={{
                top: '1.75rem',
                left: '6.25rem',
              }}
            >
              {getSpeed('dwarf')}
            </p>
            <p
              className="text-3xl absolute inset-0 text-center"
              style={{
                top: '1.75rem',
                left: '19rem',
              }}
            >
              d8
            </p>
          </div>
          {/* Inspiration / Prof */}
          <div className="flex flex-col">
            <div
              className="mx-2 h-full relative bg-contain bg-center bg-no-repeat"
              style={{
                width: '12rem',
                backgroundImage: `url(${
                  theme === ThemeMode.DARK ? inspirationLight : inspirationDark
                })`,
              }}
            >
              <div
                className="absolute rounded-full w-5 h-5 bg-primary-dark dark:bg-primary-light"
                style={{ right: '1.35rem', top: '1.25rem' }}
              ></div>
            </div>
            <div
              className="mx-2 h-full relative bg-contain bg-center bg-no-repeat"
              style={{
                width: '12rem',
                backgroundImage: `url(${
                  theme === ThemeMode.DARK ? proficiencyLight : proficiencyDark
                })`,
              }}
            >
              <p
                className="text-3xl text-center absolute"
                style={{ right: '1.45rem', top: '0.65rem' }}
              >
                {getProficiencyBonus(getLevel())}
              </p>
            </div>
          </div>
          {/* Race / Background / XP */}
          <div className="flex" style={{ width: '55rem' }}>
            <div className="w-4/12 mb-8 mx-2 border-b-2 border-primary-dark dark:border-primary-light text-2xl">
              <div>Ghostwise Halfling</div>
              <div className="-mb-10 text-primary-dark dark:text-primary-light">
                Race
              </div>
            </div>
            <div className="w-5/12 mb-8 mx-2 border-b-2 border-primary-dark dark:border-primary-light text-2xl">
              <div>Druid - Circle of the Shepherd</div>
              <div className="-mb-10 text-primary-dark dark:text-primary-light">
                Class
              </div>
            </div>
            <div className="w-3/12 mb-8 mx-2 border-b-2 border-primary-dark dark:border-primary-light text-2xl">
              <div>1000 / 4500</div>
              <div className="-mb-10 text-primary-dark dark:text-primary-light">
                XP
              </div>
            </div>
          </div>
          {/* Stats + HP / AC */}
          <div className="flex flex-wrap items-center text-center mt-2 mb-6">
            {/* Stats */}
            <div className="flex text-center">
              {Object.entries(CHARACTER_STATS).map(([key, value]) => {
                const score = getAbilityScore(key);
                const mod = getAbilityMod(score);
                return (
                  <div className="w-24 h-24 mr-2 custom-border flex flex-col items-center">
                    <div className="uppercase text-sm">{value}</div>
                    <div className="text-3xl leading-tight">{mod}</div>
                    <div className="text-lg rounded bg-yellow-100 dark:bg-primary-dark custom-border custom-border-thin h-10 w-10">
                      {score}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* HP AC */}
            <div
              className="mx-2 relative bg-contain bg-center bg-no-repeat"
              style={{
                height: '7.5rem',
                width: '7.5rem',
                backgroundImage: `url(${
                  theme === ThemeMode.DARK ? initiativeLight : initiativeDark
                })`,
              }}
            >
              <p
                className="text-2xl absolute inset-0 text-center"
                style={{
                  top: '2.5rem',
                }}
              >
                {getAbilityMod(getAbilityScore('dex'))}
              </p>
            </div>
            <div
              className="mx-2 relative bg-contain bg-center bg-no-repeat"
              style={{
                height: '7.5rem',
                width: '7.5rem',
                backgroundImage: `url(${
                  theme === ThemeMode.DARK ? acLight : acDark
                })`,
              }}
            >
              <p
                className="text-2xl absolute inset-0 text-center"
                style={{
                  top: '2.8rem',
                  left: '0.1rem',
                }}
              >
                17
              </p>
            </div>
            <div
              className="relative bg-contain bg-center bg-no-repeat"
              style={{
                height: '7.5rem',
                width: '7.5rem',
                backgroundImage: `url(${
                  theme === ThemeMode.DARK ? hpLight : hpDark
                })`,
              }}
            >
              <p
                className="text-2xl absolute inset-0 text-center"
                style={{
                  top: '1.2rem',
                  left: '0.1rem',
                }}
              >
                55
              </p>
            </div>
          </div>
        </div>
        <div className="w-3/12 h-full">
          <div className="flex flex-col">
            <div className="custom-border w-full px-2">
              <div className="flex flex-wrap">
                {Object.entries(CHARACTER_STATS).map(([key, value]) => {
                  const score = getAbilityScore(key);
                  const proficient = Boolean(isProficient(key));
                  const abilityMod = getAbilityMod(score);
                  const savingThrowMod = proficient
                    ? abilityMod + getProficiencyBonus(LEVEL)
                    : abilityMod;
                  return (
                    <div
                      className="flex flex-wrap relative p-1"
                      style={{ flex: '0 50%' }}
                    >
                      <div className="custom-border custom-border-thin uppercase flex justify-between items-center w-full">
                        <div
                          className={`${
                            proficient
                              ? 'bg-primary-dark dark:bg-primary-light'
                              : 'bg-yellow-100 dark:bg-primary-dark'
                          } border-2 border-primary-dark dark:border-primary-light left-0 absolute rounded-full w-3 h-3`}
                        ></div>
                        <div className="text-lg leading-none ml-3">{key}</div>
                        <div className="ml-2 border-2 border-primary-dark dark:border-primary-light rounded-full text-xl w-8 h-8 text-center">
                          {savingThrowMod}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xl text-center leading-none mt-2">
                Saving Throws
              </div>
            </div>
            <div className="custom-border w-full px-2">
              <div className="flex flex-wrap">
                {Object.entries(PASSIVE_SENSES).map(([key, value]) => {
                  const score = getAbilityScore(value);
                  const proficient = Boolean(isProficient(value));
                  const abilityMod = getAbilityMod(score);
                  const passiveMod =
                    (proficient
                      ? abilityMod + getProficiencyBonus(LEVEL)
                      : abilityMod) + 10;
                  return (
                    <div className="flex w-full">
                      <div className="custom-border custom-border-thin uppercase flex justify-between items-center w-full">
                        <div className="text-lg leading-none ml-3 flex-grow">
                          {key}
                        </div>
                        <div className="text-md leading-none ml-1">
                          ({value})
                        </div>
                        <div className="ml-2 border-2 border-primary-dark dark:border-primary-light rounded-full text-xl w-8 h-8 text-center">
                          {passiveMod}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xl text-center leading-none mt-2">
                Senses
              </div>
            </div>
            <div className="custom-border w-full px-2">
              <div className="flex flex-wrap">
                {Object.entries(CHARACTER_STATS).map(([key, value]) => {
                  const score = getAbilityScore(key);
                  const proficient = Boolean(isProficient(key));
                  const abilityMod = getAbilityMod(score);
                  const savingThrowMod = proficient
                    ? abilityMod + getProficiencyBonus(LEVEL)
                    : abilityMod;
                  return (
                    <div
                      className="flex flex-wrap relative p-1"
                      style={{ flex: '0 50%' }}
                    >
                      <div className="custom-border custom-border-thin uppercase flex justify-between items-center w-full">
                        <div
                          className={`${
                            proficient
                              ? 'bg-primary-dark dark:bg-primary-light'
                              : 'bg-yellow-100 dark:bg-primary-dark'
                          } border-2 border-primary-dark dark:border-primary-light left-0 absolute rounded-full w-3 h-3`}
                        ></div>
                        <div className="text-lg leading-none ml-3">{key}</div>
                        <div className="ml-2 border-2 border-primary-dark dark:border-primary-light rounded-full text-xl w-8 h-8 text-center">
                          {savingThrowMod}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xl text-center leading-none mt-2">
                Proficiencies &amp; Languages
              </div>
            </div>
          </div>
        </div>
        <div className="w-3/12 h-full">
          <div className="custom-border">
            {Object.entries(CHARACTER_SKILLS).map(([key, value]) => {
              const score = getAbilityScore(value);
              const proficient = Boolean(isProficient(value));
              const abilityMod = getAbilityMod(score);
              const skillMod = proficient
                ? abilityMod + getProficiencyBonus(LEVEL)
                : abilityMod;
              return (
                <div className="flex flex-wrap relative p-1">
                  <div className="custom-border custom-border-thin uppercase flex justify-between items-center w-full">
                    <div
                      className={`${
                        proficient
                          ? 'bg-primary-dark dark:bg-primary-light'
                          : 'bg-yellow-100 dark:bg-primary-dark'
                      } border-2 border-primary-dark dark:border-primary-light left-0 absolute rounded-full w-3 h-3`}
                    ></div>
                    <div className="text-lg leading-none ml-3 flex-grow">
                      {key}
                    </div>
                    <div className="text-md leading-none ml-1">({value})</div>
                    <div className="ml-2 border-2 border-primary-dark dark:border-primary-light rounded-full text-xl w-8 h-8 text-center">
                      {skillMod}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-6/12" style={{ height: '65rem' }}>
          <div className="custom-border h-full pb-6">
            <ul className="flex justify-between text-center">
              <li>
                <a
                  className="dark:text-yellow-500 dark:border-yellow-500 border-b-2 dark-hover:text-yellow-800"
                  href="#"
                >
                  Actions
                </a>
              </li>
              <li>
                <a
                  className="dark:text-yellow-200 dark-hover:text-yellow-800"
                  href="#"
                >
                  Spells
                </a>
              </li>
              <li>
                <a
                  className="dark:text-yellow-200 dark-hover:text-yellow-800"
                  href="#"
                >
                  Equipment
                </a>
              </li>
              <li>
                <a
                  className="dark:text-yellow-200 dark-hover:text-yellow-800"
                  href="#"
                >
                  Features &amp; Traits
                </a>
              </li>
              <li>
                <a
                  className="dark:text-yellow-200 dark-hover:text-yellow-800"
                  href="#"
                >
                  Description
                </a>
              </li>
              <li>
                <a
                  className="dark:text-yellow-200 dark-hover:text-yellow-800"
                  href="#"
                >
                  Notes
                </a>
              </li>
              <li>
                <a
                  className="dark:text-yellow-200 dark-hover:text-yellow-800"
                  href="#"
                >
                  Extras
                </a>
              </li>
            </ul>
            <div className="h-full overflow-y-scroll px-2">
              <Spells />
            </div>
          </div>
        </div>
      </div>
      {/* Right side */}
      <div className="flex flex-auto w-4/6 flex-col bg-primary-light dark:bg-secondary-dark overflow-hidden custom-border custom-border-l dark:border-primary-light">
        <div className="flex p-4 items-center">
          <div className="w-full">
            <div className="relative">
              <input
                type="search"
                placeholder="Search"
                className="appearance-none border border-gray-400 rounded-lg pl-8 pr-4 py-2 w-full"
              />
              <div className="absolute top-0 left-0 p-3 flex items-center justify-center">
                <svg
                  className="fill-current text-gray-900 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 flex-1 overflow-y-scroll">
          <Roller />
        </div>
      </div>
    </div>
  );
};
