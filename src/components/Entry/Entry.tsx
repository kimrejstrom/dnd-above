import React from 'react';
import { mainRenderer } from 'utils/mainRenderer';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';

interface Props {
  entry: any;
  highlight?: string;
  extraClassName?: string;
}

const Entry = ({ entry, highlight, extraClassName }: Props) => {
  return (
    <DangerousHtml
      data={mainRenderer.render(entry)}
      highlight={highlight}
      extraClassName={extraClassName}
    />
  );
};

export default Entry;
