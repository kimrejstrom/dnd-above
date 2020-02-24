import React from 'react';
import shield from 'images/shield.svg';
import { About } from 'pages/About/About';
import { Roller } from 'pages/Roller/Roller';

interface Props {}

export const Main: React.FC<Props> = () => {
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
      <div className="flex-auto flex flex-wrap bg-yellow-100 dark:bg-primary-dark overflow-y-scroll p-4">
        <div className="custom-border w-1/3">
          <About />
        </div>
        <div className="custom-border w-2/3 px-5">
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
          <About />
        </div>
        <div className="custom-border w-full">
          <About />
        </div>
      </div>
      {/* Right side */}
      <div className="flex flex-auto max-w-md flex-col bg-primary-light dark:bg-secondary-dark overflow-hidden custom-border custom-border-l dark:border-primary-light">
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
        {/* <!-- Chat messages --> */}
        <div className="px-6 py-4 flex-1 overflow-y-scroll">
          <Roller />
        </div>
      </div>
    </div>
  );
};
