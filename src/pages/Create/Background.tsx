import React from 'react';
import Entry from 'components/Entry/Entry';
import _ from 'lodash';
import { getBackground, getBackgroundsFluff } from 'utils/sourceDataUtils';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';

interface Props {
  background: string;
}

const Background = ({ background }: Props) => {
  const backgroundElement = getBackground(background);

  const fluff = _.find(
    getBackgroundsFluff()!,
    item => item.name === background,
  );

  return (
    <div>
      <DetailedEntryTrigger
        data={backgroundElement}
        extraClassName="tight text-md"
      >
        {`${backgroundElement?.name}, ${backgroundElement?.source}  ${backgroundElement?.page}`}
      </DetailedEntryTrigger>
      {backgroundElement?.entries?.map((entry, i) => (
        <div key={i} className="dnd-body my-2">
          <Entry extraClassName="tight" entry={entry} />
        </div>
      ))}
      {fluff && (
        <div className="dnd-body my-2">
          <h3>Additional Info</h3>
          {fluff.entries?.map((entry, i) => (
            <Entry extraClassName="tight" key={i} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Background;
