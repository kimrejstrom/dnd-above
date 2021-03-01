import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { SourceDataFuseItem } from 'utils/search';
import ToolKit from 'components/RightPanel/ToolKit';

interface Props {
  searchIndex: Array<SourceDataFuseItem>;
}

const RightPanel = ({ searchIndex }: Props) => {
  const panelOpen = useSelector((state: RootState) => state.settings).panelOpen;

  return (
    <div
      style={{ minHeight: 'calc(100% - 5rem)' }}
      className={`${
        panelOpen
          ? 'right-panel-open custom-bg bg-light-400 dark:bg-dark-200 custom-border-lg custom-border-l dark:border-light-100'
          : 'right-panel-close w-0'
      } hidden z-20 right-panel 2xl:relative absolute right-0 lg:flex flex-shrink-0 flex-col overflow-hidden pr-3`}
    >
      <ToolKit searchIndex={searchIndex} />
    </div>
  );
};

export default RightPanel;
