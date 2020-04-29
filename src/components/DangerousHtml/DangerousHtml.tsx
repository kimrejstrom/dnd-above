import React from 'react';

interface Props {
  data: string;
  extraClassName?: string;
}

const isTableElement = (data: string) => {
  const tableElements = ['<td', '<tr', '<th'];
  return tableElements.includes(data.trim().slice(0, 3)) ? true : false;
};

const DangerousHtml = ({ data, extraClassName }: Props) => {
  if (isTableElement(data)) {
    return (
      <table
        className={`${extraClassName ? extraClassName : ''}`}
        dangerouslySetInnerHTML={{
          __html: data,
        }}
      ></table>
    );
  } else {
    return (
      <div
        className={`${extraClassName ? extraClassName : ''}`}
        dangerouslySetInnerHTML={{
          __html: data,
        }}
      ></div>
    );
  }
};

export default DangerousHtml;
