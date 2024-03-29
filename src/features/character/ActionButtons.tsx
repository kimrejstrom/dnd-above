import React from 'react';
import StyledButton from 'components/StyledButton/StyledButton';
import {
  CharacterListItem,
  longRest,
  expendHitDie,
  setHp,
} from 'features/character/characterListSlice';
import { useDispatch } from 'react-redux';
import { toggleModal } from 'components/Modal/modalSlice';
import { search } from 'utils/mainRenderer';
import {
  calculateStats,
  getAbilityMod,
  getHitDice,
  getMaxHP,
  isSpellCaster,
} from 'utils/character';
import Entry from 'components/Entry/Entry';
import AbilitiesSkillsModal from 'features/character/AbilitiesSkillsModal';
import SpellsModal from 'features/character/SpellsModal';
import FeatsModal from 'features/character/FeatsModal';
import { diceRoller } from 'utils/dice';
import { getAllClassFeatures } from 'utils/sourceDataUtils';
import ItemsModal from 'features/character/ItemsModal';
import TextBox from 'components/TextBox/TextBox';
import skullDividerLight from 'images/skulldivider-light.png';

interface Props {
  character: CharacterListItem;
  readonly: boolean;
}

interface ModalProps {
  character: CharacterListItem;
}

const LongRestForm: React.FC<ModalProps> = ({ character }) => {
  const dispatch = useDispatch();
  return (
    <div>
      <div className="text-xl">
        <StyledButton
          onClick={() => {
            dispatch(longRest({ id: character.id! }));
            dispatch(
              setHp({
                id: character.id!,
                hp: getMaxHP(character),
                type: 'set',
              }),
            );
            // Close modal
            setTimeout(() => {
              dispatch(toggleModal({ visible: false }));
            }, 500);
          }}
        >
          Long Rest
        </StyledButton>
      </div>
      <div className="dnd-body mt-3 custom-border custom-border-medium custom-border-t">
        <TextBox>
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
        </TextBox>
      </div>
    </div>
  );
};

const ShortRestForm: React.FC<ModalProps> = ({ character }) => {
  const dispatch = useDispatch();
  const isDisabled = character.gameData.currentHd <= 0;
  const handleExpendHitDie = () => {
    const mod = getAbilityMod(calculateStats(character)['con']);
    const rolledHp = diceRoller.roll(`1${getHitDice(character)}`).total;
    const fullHp = getMaxHP(character);
    const newHp = character.gameData.currentHp + rolledHp + mod;

    dispatch(
      expendHitDie({
        id: character.id!,
        newHp: newHp < fullHp ? newHp : fullHp,
      }),
    );
    // Close modal
    setTimeout(() => {
      dispatch(toggleModal({ visible: false }));
    }, 500);
  };

  return (
    <div>
      <div className="text-xl">
        Expendable Hit Dice:{' '}
        <span className="text-2xl mr-4">{character.gameData.currentHd}</span>
        <StyledButton disabled={isDisabled} onClick={handleExpendHitDie}>
          Use
        </StyledButton>
      </div>
      <div className="dnd-body mt-3 custom-border custom-border-medium custom-border-t">
        <TextBox>
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
        </TextBox>
      </div>
    </div>
  );
};

const ActionButtons = ({ character, readonly }: Props) => {
  const dispatch = useDispatch();
  const handleLongRest = () => {
    dispatch(
      toggleModal({
        visible: true,
        title: 'Long Rest',
        content: <LongRestForm character={character} />,
      }),
    );
  };

  const handleShortRest = () => {
    dispatch(
      toggleModal({
        visible: true,
        title: 'Short Rest',
        content: <ShortRestForm character={character} />,
      }),
    );
  };

  const handleAbilityScores = () =>
    dispatch(
      toggleModal({
        visible: true,
        title: 'Ability Scores',
        content: <AbilitiesSkillsModal character={character} />,
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

  const handleEquipment = () =>
    dispatch(
      toggleModal({
        visible: true,
        title: 'Your Equipment and Items',
        content: <ItemsModal />,
      }),
    );

  const handleFeats = () =>
    dispatch(
      toggleModal({
        visible: true,
        title: 'Your Feats',
        content: <FeatsModal character={character} />,
      }),
    );

  const actionBtnCls = `ml-1 mb-1 h-10 custom-border-medium w-28 md:w-auto xl:px-3`;

  return (
    <div>
      <div
        className="h-10 md:h-12 w-full my-2 relative bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${skullDividerLight})`,
        }}
      ></div>
      <div className="flex md:flex-grow flex-wrap justify-center">
        <StyledButton
          extraClassName={actionBtnCls}
          onClick={handleShortRest}
          disabled={readonly}
        >
          Short Rest
        </StyledButton>
        <StyledButton
          extraClassName={actionBtnCls}
          onClick={handleLongRest}
          disabled={readonly}
        >
          Long Rest
        </StyledButton>
        <StyledButton
          extraClassName={actionBtnCls}
          onClick={handleAbilityScores}
          disabled={readonly}
        >
          Ability Scores
        </StyledButton>
        {isSpellCaster(character) && (
          <StyledButton
            extraClassName={actionBtnCls}
            onClick={handleSpells}
            disabled={readonly}
          >
            Spells
          </StyledButton>
        )}
        <StyledButton
          extraClassName={actionBtnCls}
          onClick={handleEquipment}
          disabled={readonly}
        >
          Equipment
        </StyledButton>
        <StyledButton
          extraClassName={actionBtnCls}
          onClick={handleFeats}
          disabled={readonly}
        >
          Feats
        </StyledButton>
      </div>
    </div>
  );
};

export default ActionButtons;
