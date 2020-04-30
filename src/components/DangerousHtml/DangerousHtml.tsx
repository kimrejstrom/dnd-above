import React from 'react';
import { isTableElement } from 'utils/render';

interface Props {
  data: string;
  extraClassName?: string;
}

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
