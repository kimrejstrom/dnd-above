import React from 'react';
import { isTableElement } from 'utils/render';

interface Props {
  data: string;
  highlight?: string;
  extraClassName?: string;
  prose?: boolean;
}

const getHighlightedText = (text: string, highlight: string) => {
  // Split on highlight term and include term into parts, ignore case
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  const result = parts.map(
    (part, i) =>
      `<span class=${
        part.toLowerCase() === highlight.toLowerCase() ? 'font-bold' : ''
      }
    >
      ${part}
    </span>`,
  );
  return result.join('');
};

const DangerousHtml = ({
  data,
  highlight,
  extraClassName,
  prose = true,
}: Props) => {
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
        className={`${
          prose
            ? 'dark:prose-dark sm:prose-sm md:prose lg:prose sm:max-w-none md:max-w-none lg:max-w-none'
            : ''
        } ${extraClassName ? extraClassName : ''}`}
        dangerouslySetInnerHTML={{
          __html: highlight ? getHighlightedText(data, highlight) : data,
        }}
      ></div>
    );
  }
};

export default DangerousHtml;
