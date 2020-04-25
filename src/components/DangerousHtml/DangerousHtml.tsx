import React from 'react';

interface Props {
  data: string;
  extraClassName?: string;
}

const DangerousHtml = ({ data, extraClassName }: Props) => {
  if (data.includes('<tr>')) {
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
