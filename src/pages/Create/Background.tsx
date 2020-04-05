import React from 'react';
import { BackgroundElement } from 'models/background';
import Entry from 'components/Entry/Entry';
import { BACKGROUNDS_FLUFF } from 'utils/data';
import _ from 'lodash';

interface Props {
  background: BackgroundElement;
}

const Background = ({ background }: Props) => {
  const fluff = _.find(
    BACKGROUNDS_FLUFF,
    item => item.name === background.name,
  );
  return (
    <div>
      <div className="text-xl">{`${background.name}, ${background.source}  ${background.page}`}</div>
      {background.entries?.map(entry => (
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
