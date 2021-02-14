import React from 'react';

interface Props {
  onSearch: (e: any) => void;
}
const SearchBar = ({ onSearch }: Props) => {
  return (
    <div className="flex py-3 items-center">
      <div className="w-full">
        <div className="relative">
          <input
            name="search"
            type="text"
            placeholder="Search..."
            className="form-input rounded pl-8 pr-4 py-2 w-full"
            autoComplete="off"
            onKeyUp={onSearch}
            onChange={onSearch} // handles "clear search" click
          />
          <div className="absolute top-0 left-0 p-3 flex items-center justify-center">
            <svg
              className="fill-current text-dark-100 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
