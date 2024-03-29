import React, { useState } from 'react';

interface PillFilterProps {
  pills: string[];
  children: JSX.Element[];
}

interface ContentBlockProps {
  name: string;
  heading?: string;
}

export const ContentBlock: React.FC<ContentBlockProps> = ({
  name,
  heading,
  children,
}) => (
  <>
    <div className="leading-tight w-full custom-border custom-border-thin custom-border-b border-dark-100 dark:border-light-100 text-xl">
      <div className="-mb-3 text-highlight-100 dark:text-yellow-500">
        {heading ?? name}
      </div>
    </div>
    <div className="mt-2 mb-4">{children}</div>
  </>
);

const PillFilter: React.FC<PillFilterProps> = ({ pills, children }) => {
  const [selected, setSelected] = useState('all');

  return (
    <div>
      <div className="flex justify-center flex-wrap">
        {['all'].concat(pills).map(pill => (
          <button
            key={pill}
            onClick={() => setSelected(pill)}
            className={`${
              selected === pill
                ? 'text-white dark:text-black bg-dark-100 dark:bg-yellow-500'
                : 'text-black bg-gray-200 dark:bg-light-100'
            } tracking-tighter rounded-full p-1 px-4 uppercase mx-1 my-2 whitespace-nowrap`}
          >
            {pill}
          </button>
        ))}
      </div>
      <div className="flex flex-col">
        {selected === 'all'
          ? children.map(elem => elem)
          : children.find(elem => elem.props.name === selected)}
      </div>
    </div>
  );
};

export default PillFilter;
