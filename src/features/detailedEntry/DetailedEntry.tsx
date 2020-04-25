import React from 'react';

interface Props {
  data?: any;
}

const DetailedEntry = ({ data }: Props) =>
  data ? (
    <div className="w-full">{data}</div>
  ) : (
    <div className="opacity-50 p-4 h-full flex text-center justify-center items-center">
      <div>
        Select elements on the character sheet to display more information about
        them.
      </div>
    </div>
  );

export default DetailedEntry;
