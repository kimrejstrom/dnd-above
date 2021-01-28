import React from 'react';
import { useDispatch } from 'react-redux';
import { setDetailedEntry } from 'features/detailedEntry/detailedEntrySlice';
import Entry from 'components/Entry/Entry';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';

interface Props {
  data: any;
  renderer?: any;
  jsx?: JSX.Element;
  extraClassName?: string;
}

const DetailedEntryTrigger: React.FC<Props> = ({
  data,
  renderer,
  jsx,
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
            jsx ? (
              jsx
            ) : renderer ? (
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
