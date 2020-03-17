import React from 'react';
import mainRenderer from 'utils/mainRenderer';

interface Props {
  entry: any;
}

const Entry = ({ entry }: Props) => {
  return (
    <div dangerouslySetInnerHTML={{ __html: mainRenderer.render(entry) }}></div>
  );
};

export default Entry;
