import React from 'react';
import mainRenderer from 'utils/mainRenderer';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';

interface Props {
  entry: any;
  extraClassName?: string;
}

const Entry = ({ entry, extraClassName }: Props) => {
  return (
    <DangerousHtml
      data={mainRenderer.render(entry)}
      extraClassName={extraClassName}
    />
  );
};

export default Entry;
