import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import PillFilter, { ContentBlock } from 'components/PillFilter/PillFilter';
import actionsDark from 'images/actions-dark.png';
import actionsLight from 'images/actions-light.png';
import { CharacterState } from 'features/character/characterListSlice';
import { getItem, isSpellCaster, getSpell } from 'utils/character';
import Items from 'components/Items/Items';
import { isDefined } from 'ts-is-present';
import { mainRenderer } from 'utils/mainRenderer';
import { Property } from 'models/item';
import { ACTIONS } from 'utils/data';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';
import { Spells } from 'components/Spells/Spells';

interface Props {
  character: CharacterState;
}

const getActions = (filterCondition: string) => {
  return ACTIONS.action
    .filter(
      actionElem =>
        actionElem.time?.filter(
          time => typeof time !== 'string' && time.unit === filterCondition,
        ).length,
    )
    .map(actionElem => (
      <DetailedEntryTrigger
        key={actionElem.name}
        data={actionElem}
        extraClassName="inline mr-1 dnd-body"
      >
        {`${actionElem.name}, `}
      </DetailedEntryTrigger>
    ));
};

const getSpellsByCastingTime = (
  character: CharacterState,
  filterCondition: string,
) =>
  character.gameData.spells
    .map(sp => getSpell(sp.name))
    .filter(isDefined)
    .filter(
      sp => sp.time.filter(entry => entry.unit === filterCondition).length,
    )
    .map(sp => (
      <DetailedEntryTrigger
        key={sp.name}
        extraClassName="inline mr-1 dnd-body"
        data={sp}
      >
        {`${sp.name}, `}
      </DetailedEntryTrigger>
    ));

const getAttackEquipment = (character: CharacterState) =>
  character.equipmentData.items
    .map(itemName => getItem(itemName))
    .map(item => {
      const [
        damage,
        damageType,
        propertiesTxt,
      ] = mainRenderer.item.getDamageAndPropertiesText(item);
      if (damage && damageType && propertiesTxt) {
        return {
          ...item,
          name: item?.name,
          range: item?.range
            ? `${item.range} feet`
            : item?.property?.includes(Property.R)
            ? '10 feet'
            : '5 feet',
          damage: damage,
          type: damageType,
          notes: propertiesTxt,
        };
      } else {
        return undefined;
      }
    })
    .filter(isDefined);

const getAttackSpells = (character: CharacterState) =>
  character.gameData.spells
    .map(sp => getSpell(sp.name))
    .filter(isDefined)
    .filter(sp => sp?.spellAttack !== undefined)
    .map(sp => {
      return {
        ...sp,
        name: sp.name,
        range: sp.range,
        damage: sp.scalingLevelDice?.scaling['1'] || '–',
        type: sp.damageInflict?.join(', '),
        notes: `Level ${sp.level}`,
      };
    });

const Actions = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  const isSpellCasterClass = isSpellCaster(character);
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
          <div>Weapons</div>
          <Items
            items={getAttackEquipment(character) as any}
            columns={['name', 'range', 'damage', 'type', 'notes']}
          />
          {isSpellCasterClass && (
            <>
              <div>Spells</div>
              <Spells
                spells={getAttackSpells(character) as any}
                columns={['name', 'type', 'range', 'damage', 'notes']}
              />
            </>
          )}
        </ContentBlock>
        <ContentBlock name="action">
          <div>Actions in Combat</div>
          {ACTIONS.action
            .filter(
              actionElem =>
                actionElem.time?.filter(
                  time =>
                    (typeof time !== 'string' && time.unit === 'action') ||
                    time === 'Varies',
                ).length,
            )
            .map(actionElem => (
              <DetailedEntryTrigger
                key={actionElem.name}
                data={actionElem}
                extraClassName="inline mr-1 dnd-body"
              >
                {`${actionElem.name}, `}
              </DetailedEntryTrigger>
            ))}
        </ContentBlock>
        <ContentBlock name="bonus action">
          <div>Actions in combat</div>
          {getActions('bonus')}
          {isSpellCasterClass && (
            <>
              <div>Spells</div>
              <div className="dnd-body">
                {getSpellsByCastingTime(character, 'bonus')}
              </div>
            </>
          )}
        </ContentBlock>
        <ContentBlock name="reaction">
          <div>Actions in combat</div>
          {getActions('reaction')}
          {isSpellCasterClass && (
            <>
              <div>Spells</div>
              <div className="dnd-body">
                {getSpellsByCastingTime(character, 'reaction')}
              </div>
            </>
          )}
        </ContentBlock>
      </PillFilter>
    </>
  );
};

export default Actions;
