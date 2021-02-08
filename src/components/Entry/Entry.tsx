import React from 'react';
import { mainRenderer } from 'utils/mainRenderer';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';

interface Props {
  entry: any;
  highlight?: string;
  extraClassName?: string;
  prose?: boolean;
}

const Entry = ({ entry, highlight, extraClassName, prose }: Props) => {
  return (
    <DangerousHtml
      data={mainRenderer.render(entry)}
      highlight={highlight}
      extraClassName={extraClassName}
      prose={prose}
    />
  );
};

export default Entry;
