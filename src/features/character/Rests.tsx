import React from 'react';
import StyledButton from 'components/StyledButton/StyledButton';
import {
  CharacterState,
  longRest,
  expendHitDie,
} from 'features/character/characterListSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toggleModal } from 'components/Modal/modalSlice';
import { search } from 'utils/mainRenderer';
import { getAllClassFeatures } from 'utils/character';
import Entry from 'components/Entry/Entry';
import { getSelectedCharacter } from 'app/selectors';

interface Props {
  character: CharacterState;
}

const LongRestForm = () => {
  const character = useSelector(getSelectedCharacter);
  return (
    <div className="dnd-body">
      <div>
        Long Rest features:{' '}
        <ul className="list-disc p-4">
          {search(
            getAllClassFeatures(
              character.classData.classElement,
              character.classData.subClass,
            ),
            'finish a long',
          ).map((entry: any) => (
            <li>{<Entry entry={entry} highlight=" long " />}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ShortRestForm = () => {
  const dispatch = useDispatch();
  const character = useSelector(getSelectedCharacter);
  const isDisabled = character.gameData.currentHd <= 0;

  return (
    <div>
      <div>
        Expendable Hit Dice: {character.gameData.currentHd}
        <StyledButton
          disabled={isDisabled}
          onClick={() => dispatch(expendHitDie({ id: character.id! }))}
        >
          Use Hit Die
        </StyledButton>
      </div>
      <div className="dnd-body">
        Short Rest features:{' '}
        <ul className="list-disc p-4">
          {search(
            getAllClassFeatures(
              character.classData.classElement,
              character.classData.subClass,
            ),
            'finish a short',
          ).map((entry: any) => (
            <li>{<Entry entry={entry} highlight=" short " />}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Rests = ({ character }: Props) => {
  const dispatch = useDispatch();
  const handleLongRest = () => {
    dispatch(
      toggleModal({
        visible: true,
        title: 'Long Rest',
        content: <LongRestForm />,
      }),
    );
    dispatch(longRest({ id: character.id! }));
  };

  const handleShortRest = () => {
    dispatch(
      toggleModal({
        visible: true,
        title: 'Short Rest',
        content: <ShortRestForm />,
      }),
    );
  };

  return (
    <>
      <StyledButton
        extraClassName="ml-2 xl:-mt-1 mb-1 h-10 custom-border-medium"
        onClick={handleShortRest}
      >
        Short Rest
      </StyledButton>
      <StyledButton
        extraClassName="ml-2 mb-1 h-10 custom-border-medium"
        onClick={handleLongRest}
      >
        Long Rest
      </StyledButton>
    </>
  );
};

export default Rests;
