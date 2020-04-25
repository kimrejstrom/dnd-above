import React from 'react';
import { useDispatch } from 'react-redux';
import { setDetailedEntry } from 'features/detailedEntry/detailedEntrySlice';
import Entry from 'components/Entry/Entry';

interface Props {
  data: any;
  extraClassName?: string;
}

const DetailedEntryTrigger: React.FC<Props> = ({
  data,
  extraClassName,
  children,
}) => {
  const dispatch = useDispatch();
  return (
    <div
      className={`${extraClassName} cursor-pointer`}
      onClick={() => dispatch(setDetailedEntry(<Entry entry={data} />))}
    >
      {children}
    </div>
  );
};

export default DetailedEntryTrigger;
