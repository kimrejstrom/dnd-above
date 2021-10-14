import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import PillFilter, { ContentBlock } from 'components/PillFilter/PillFilter';
import actionsDark from 'images/actions-dark.png';
import actionsLight from 'images/actions-light.png';
import { CharacterListItem } from 'features/character/characterListSlice';
import { getSpellDamage, isSpellCaster } from 'utils/character';
import {
  getItem,
  getSpellFromList,
  getSpells,
  getActions as getActionsData,
} from 'utils/sourceDataUtils';
import Items from 'components/Items/Items';
import { isDefined } from 'ts-is-present';
import { mainRenderer, Parser } from 'utils/mainRenderer';
import { Property } from 'models/item';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';
import { Spells } from 'components/Spells/Spells';
import { SpellElement } from 'models/spells';
import { RenderSpell } from 'utils/render';

interface Props {
  character: CharacterListItem;
}

const getActions = (filterCondition: string) => {
  return getActionsData()!
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
        extraClassName="inline mr-0.5 text-sm dnd-body"
      >
        {`${actionElem.name}, `}
      </DetailedEntryTrigger>
    ));
};

const getSpellsByCastingTime = (
  character: CharacterListItem,
  spells: SpellElement[],
  filterCondition: string,
) =>
  character.gameData.spells
    .map(sp => getSpellFromList(spells, sp))
    .filter(isDefined)
    .filter(
      sp => sp.time.filter(entry => entry.unit === filterCondition).length,
    )
    .map(sp => (
      <DetailedEntryTrigger
        key={sp.name}
        extraClassName="tight"
        data={sp}
        renderer={RenderSpell(sp)}
      >
        <div className="flex items-center mr-0.5 dnd-body text-sm">
          <div>{sp.duration[0].concentration ? `${sp.name} ✱` : sp.name}</div>
          <div className="mx-1 text-xs opacity-50">{` (${Parser.spLevelToFull(
            sp.level,
          )}), `}</div>
        </div>
      </DetailedEntryTrigger>
    ));

const getAttackEquipment = (character: CharacterListItem) =>
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
          damage: `${damage} (${damageType})`,
          notes: propertiesTxt,
        };
      } else {
        return undefined;
      }
    })
    .filter(isDefined);

const getAttackSpells = (
  character: CharacterListItem,
  spells: SpellElement[],
) =>
  character.gameData.spells
    .map(sp => getSpellFromList(spells, sp))
    .filter(isDefined)
    .filter(sp => sp?.spellAttack !== undefined)
    .map(sp => {
      return {
        ...sp,
        name: sp.name,
        range: sp.range,
        damage: `${getSpellDamage(sp) || '–'} (${sp.damageInflict?.join(
          ', ',
        )})`,
        notes: `Level ${sp.level}`,
      };
    });

const Actions = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  const isSpellCasterClass = isSpellCaster(character);

  return (
    <>
      <div
        className="w-full mt-2 relative bg-contain bg-center bg-no-repeat"
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
          {getAttackEquipment(character).length > 0 && (
            <Items
              items={getAttackEquipment(character) as any}
              columns={['name', 'range', 'damage', 'notes']}
            />
          )}
          {isSpellCasterClass &&
            getAttackSpells(character, getSpells()!).length > 0 && (
              <>
                <div>Spells</div>
                <Spells
                  spells={getAttackSpells(character, getSpells()!) as any}
                  columns={['name', 'range', 'damage', 'notes']}
                />
              </>
            )}
        </ContentBlock>
        <ContentBlock name="action">
          <div>Actions in Combat</div>
          {getActionsData()!
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
                extraClassName="inline mr-0.5 dnd-body text-sm"
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
              <div className="dnd-body flex">
                {getSpellsByCastingTime(character, getSpells()!, 'bonus')}
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
              <div className="dnd-body flex">
                {getSpellsByCastingTime(character, getSpells()!, 'reaction')}
              </div>
            </>
          )}
        </ContentBlock>
      </PillFilter>
    </>
  );
};

export default Actions;
