import React from 'react';
import shield from 'images/shield.svg';
import { About } from 'pages/About/About';

interface Props {}

export const Main: React.FC<Props> = () => {
  return (
    <div className="h-screen flex">
      {/* Sidebar / channel list */}
      <div className="bg-black text-purple-lighter flex-none w-24 p-6 hidden md:block font-sans">
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
      {/* Left main menu */}
      <div className="bg-secondary-dark text-gray-200 flex-none w-64 pb-6 hidden md:block">
        <div className="text-white mb-2 mt-3 px-4 flex justify-between">
          <div className="flex-auto">
            <h1 className="font-semibold text-3xl truncate">Moe Glee</h1>
            <div className="flex items-center mb-6">
              <span className="text-white opacity-50 text-sm">
                Halfling Shepherd Druid
              </span>
            </div>
          </div>
        </div>
        <div className="mb-8 font-sans">
          <div className="px-4 mb-2 text-white flex justify-between items-center">
            <div className="opacity-75 font-bold">Character Info</div>
          </div>
          <div className="bg-yellow-900 py-1 flex items-center py-1 px-4">
            <span className="text-white">Stats</span>
            <span className="bg-green-400 rounded-full block w-2 h-2 ml-2"></span>
          </div>
          <div className="flex items-center py-1 px-4">
            <span className="text-white opacity-75">Background</span>
          </div>
          <div className="flex items-center py-1 px-4">
            <span className="text-white opacity-75">Spells</span>
          </div>
          <div className="flex items-center py-1 px-4">
            <span className="text-white opacity-75">Inventory</span>
          </div>
        </div>
        <div className="mb-8 font-sans">
          <div className="px-4 mb-2 text-white flex justify-between items-center">
            <div className="opacity-75 font-bold">Additional info</div>
            <div>
              <svg
                className="fill-current h-4 w-4 opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M11 9h4v2h-4v4H9v-4H5V9h4V5h2v4zm-1 11a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center py-1 px-4">
            <span className="text-white opacity-75">Notes (Session 1)</span>
            <span className="bg-green-400 rounded-full block w-2 h-2 ml-2"></span>
          </div>
          <div className="flex items-center py-1 px-4">
            <span className="text-white opacity-75">Ratings and comments</span>
          </div>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-auto flex flex-wrap bg-primary-dark overflow-y-scroll p-4">
        <div className="custom-border custom-border-light w-1/3">
          <About />
        </div>
        <div className="custom-border custom-border-light w-2/3">
          <About />
        </div>
        <div className="custom-border custom-border-light w-full">
          <About />
        </div>
      </div>
      {/* Right side */}
      <div className="flex flex-auto max-w-md flex-col bg-black overflow-hidden">
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
          <About />
        </div>
      </div>
    </div>
  );
};
