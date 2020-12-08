import React from 'react';
import StyledButton from 'components/StyledButton/StyledButton';
import {
  CharacterListItem,
  longRest,
  expendHitDie,
} from 'features/character/characterListSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toggleModal } from 'components/Modal/modalSlice';
import { search } from 'utils/mainRenderer';
import { getAllClassFeatures, isSpellCaster } from 'utils/character';
import Entry from 'components/Entry/Entry';
import { getSelectedCharacter } from 'app/selectors';
import AbilitiesSkillsModal from 'features/character/AbilitiesSkillsModal';
import SpellsModal from 'features/character/SpellsModal';
import FeatsModal from 'features/character/FeatsModal';

interface Props {
  character: CharacterListItem;
}

const LongRestForm = () => {
  const dispatch = useDispatch();
  const character = useSelector(getSelectedCharacter);
  return (
    <div>
      <div className="text-xl">
        <StyledButton
          onClick={() => {
            dispatch(longRest({ id: character.id! }));
            // Close modal
            setTimeout(() => {
              dispatch(toggleModal({ visible: false }));
            }, 1000);
          }}
        >
          Long Rest
        </StyledButton>
      </div>
      <div className="dnd-body mt-3 custom-border custom-border-medium custom-border-t">
        <div className="text-xl">Long Rest features:</div>
        <ul className="list-disc p-4">
          {search(
            getAllClassFeatures(
              character.classData.classElement,
              character.classData.subClass,
            ),
            ['finish a long', 'finish a short or long rest'],
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
      <div className="text-xl">
        Expendable Hit Dice:{' '}
        <span className="text-2xl mr-4">{character.gameData.currentHd}</span>
        <StyledButton
          disabled={isDisabled}
          onClick={() => dispatch(expendHitDie({ id: character.id! }))}
        >
          Use
        </StyledButton>
      </div>
      <div className="dnd-body mt-3 custom-border custom-border-medium custom-border-t">
        <div className="text-xl">Short Rest features:</div>
        <ul className="list-disc p-4">
          {search(
            getAllClassFeatures(
              character.classData.classElement,
              character.classData.subClass,
            ),
            ['finish a short'],
          ).map((entry: any, i) => (
            <li key={`entry-${i}`}>
              {<Entry entry={entry} highlight=" short " />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ActionButtons = ({ character }: Props) => {
  const dispatch = useDispatch();
  const handleLongRest = () => {
    dispatch(
      toggleModal({
        visible: true,
        title: 'Long Rest',
        content: <LongRestForm />,
      }),
    );
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

  const handleAbilityScores = () =>
    dispatch(
      toggleModal({
        visible: true,
        title: 'Ability Scores',
        content: <AbilitiesSkillsModal />,
      }),
    );

  const handleSpells = () =>
    dispatch(
      toggleModal({
        visible: true,
        title: 'Your Spells',
        content: <SpellsModal />,
      }),
    );

  const handleFeats = () =>
    dispatch(
      toggleModal({
        visible: true,
        title: 'Your Feats',
        content: <FeatsModal />,
      }),
    );

  return (
    <>
      <StyledButton
        extraClassName="sm:ml-2 ml-1 mb-1 h-10 custom-border-medium"
        onClick={handleShortRest}
      >
        Short Rest
      </StyledButton>
      <StyledButton
        extraClassName="sm:ml-2 ml-1 mb-1 h-10 custom-border-medium"
        onClick={handleLongRest}
      >
        Long Rest
      </StyledButton>
      <StyledButton
        extraClassName="sm:ml-2 ml-1 mb-1 h-10 custom-border-medium"
        onClick={handleAbilityScores}
      >
        Ability Scores
      </StyledButton>
      {isSpellCaster(character) && (
        <StyledButton
          extraClassName="sm:ml-2 ml-1 mb-1 h-10 custom-border-medium"
          onClick={handleSpells}
        >
          Spells
        </StyledButton>
      )}
      <StyledButton
        extraClassName="sm:ml-2 ml-1 mb-1 h-10 custom-border-medium"
        onClick={() => console.log('TODO')}
      >
        Equipment
      </StyledButton>
      <StyledButton
        extraClassName="ml-2 mb-1 h-10 custom-border-medium"
        onClick={handleFeats}
      >
        Feats
      </StyledButton>
    </>
  );
};

export default ActionButtons;
