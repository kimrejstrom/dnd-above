import React, { useState } from 'react';

interface PillFilterProps {
  pills: string[];
  children: JSX.Element[];
}

interface ContentBlockProps {
  name: string;
}

export const ContentBlock: React.FC<ContentBlockProps> = ({
  name,
  children,
}) => (
  <>
    <div className="leading-tight w-full custom-border custom-border-thin custom-border-b border-primary-dark dark:border-primary-light text-xl">
      {name}
    </div>
    <div className="mt-2 mb-4">{children}</div>
  </>
);

const PillFilter: React.FC<PillFilterProps> = ({ pills, children }) => {
  const [selected, setSelected] = useState('all');

  return (
    <div>
      <div className="flex">
        {['all'].concat(pills).map(pill => (
          <button
            onClick={() => setSelected(pill)}
            className={`${
              selected === pill
                ? 'text-white dark:text-black bg-primary-dark dark:bg-primary-light'
                : 'text-black bg-gray-200 dark:bg-yellow-500'
            } rounded-full px-4 uppercase mx-1 my-2`}
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