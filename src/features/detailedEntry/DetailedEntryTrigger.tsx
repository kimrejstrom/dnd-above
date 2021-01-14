import React from 'react';
import { useDispatch } from 'react-redux';
import { setDetailedEntry } from 'features/detailedEntry/detailedEntrySlice';
import Entry from 'components/Entry/Entry';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';

interface Props {
  data: any;
  renderer?: any;
  extraClassName?: string;
}

const DetailedEntryTrigger: React.FC<Props> = ({
  data,
  renderer,
  extraClassName,
  children,
}) => {
  const dispatch = useDispatch();
  return (
    <div
      className={`${extraClassName ? extraClassName : ''} cursor-pointer`}
      onClick={() =>
        dispatch(
          setDetailedEntry(
            renderer ? (
              <DangerousHtml extraClassName={extraClassName} data={renderer} />
            ) : (
              <Entry extraClassName={extraClassName} entry={data} />
            ),
          ),
        )
      }
    >
      {children}
    </div>
  );
};

export default DetailedEntryTrigger;
