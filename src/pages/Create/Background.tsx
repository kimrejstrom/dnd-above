import React from 'react';
import Entry from 'components/Entry/Entry';
import { BACKGROUNDS_FLUFF } from 'utils/data';
import _ from 'lodash';
import { getBackground } from 'utils/character';

interface Props {
  background: string;
}

const Background = ({ background }: Props) => {
  const backgroundElement = getBackground(background);
  const fluff = _.find(BACKGROUNDS_FLUFF, item => item.name === background);
  return (
    <div>
      <div className="text-xl">{`${backgroundElement?.name}, ${backgroundElement?.source}  ${backgroundElement?.page}`}</div>
      {backgroundElement?.entries?.map(entry => (
        <div className="dnd-body my-2 custom-border custom-border-thin">
          <Entry entry={entry} />
        </div>
      ))}
      {fluff && (
        <div className="dnd-body my-2 custom-border custom-border-thin">
          <h3>Additional Info</h3>
          {fluff.entries?.map(entry => (
            <Entry entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Background;
