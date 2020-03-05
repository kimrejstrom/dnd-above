import React from 'react';
import shield from 'images/shield.svg';
import { Roller } from 'pages/Roller/Roller';
import { Spells } from 'pages/Spells/Spells';
import { random } from 'lodash/fp';

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
  return (
    <div className="h-body flex">
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
        <div className="w-full flex text-center mb-8">
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
        <div className="w-6/12 h-full">
          <div className="custom-border h-full">
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
      <div className="flex flex-auto w-2/5 flex-col bg-primary-light dark:bg-secondary-dark overflow-hidden custom-border custom-border-l dark:border-primary-light">
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
