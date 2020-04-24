import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import PillFilter, { ContentBlock } from 'components/PillFilter/PillFilter';
import actionsDark from 'images/actions-dark.png';
import actionsLight from 'images/actions-light.png';
import { CharacterState } from 'features/character/characterListSlice';

interface Props {
  character: CharacterState;
}

const Actions = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  return (
    <>
      <div
        className="w-full my-2 relative bg-contain bg-center bg-no-repeat"
        style={{
          height: '5rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? actionsLight : actionsDark
          })`,
        }}
      ></div>
      <PillFilter pills={['attack', 'action', 'bonus action', 'reaction']}>
        <ContentBlock name="attack">
          <div>Attack</div>
        </ContentBlock>
        <ContentBlock name="action">
          <div>Action</div>
        </ContentBlock>
        <ContentBlock name="bonus action">
          <div>Bonus Action</div>
        </ContentBlock>
        <ContentBlock name="reaction">
          <div>Reaction</div>
        </ContentBlock>
      </PillFilter>
    </>
  );
};

export default Actions;
