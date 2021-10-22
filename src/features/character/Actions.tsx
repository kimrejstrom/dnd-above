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
  getAllClassFeatures,
  getRace,
} from 'utils/sourceDataUtils';
import Items from 'components/Items/Items';
import { isDefined } from 'ts-is-present';
import { mainRenderer, Parser, search } from 'utils/mainRenderer';
import { Property } from 'models/item';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';
import { Spells } from 'components/Spells/Spells';
import { SpellElement } from 'models/spells';
import { RenderSpell } from 'utils/render';
import { Unit } from 'models/actions';

interface Props {
  character: CharacterListItem;
}

const getActions = (filterCondition: Unit) => {
  const actions = getActionsData()!.filter(
    actionElem =>
      actionElem.time?.filter(time =>
        filterCondition === Unit.Action
          ? time === 'Varies' ||
            (typeof time !== 'string' && time.unit === filterCondition)
          : typeof time !== 'string' && time.unit === filterCondition,
      ).length,
  );
  const lastIndex = actions.length - 1;
  return actions.map((actionElem, i) => {
    return (
      <DetailedEntryTrigger
        key={actionElem.name}
        data={actionElem}
        extraClassName="inline mr-0.5 text-sm dnd-body"
      >
        {i === lastIndex ? `${actionElem.name}` : `${actionElem.name}, `}
      </DetailedEntryTrigger>
    );
  });
};

const getClassFeatures = (
  character: CharacterListItem,
  filterCondition: string,
  not?: string,
) => {
  const features = getAllClassFeatures(
    character.classData.classElement,
    character.classData.subClass,
  );
  const relevantEntryNames = search(features, [filterCondition], not).map(
    (entry: any, i) => entry.name,
  );
  const relevantFeatures = features.filter(feature =>
    relevantEntryNames.includes(feature.name),
  );

  const lastIndex = relevantFeatures.length - 1;
  return lastIndex >= 0 ? (
    relevantFeatures.map((feature, i) => (
      <DetailedEntryTrigger
        key={feature.name}
        data={feature}
        extraClassName="inline mr-0.5 text-sm dnd-body"
      >
        {i === lastIndex ? `${feature.name}` : `${feature.name}, `}
      </DetailedEntryTrigger>
    ))
  ) : (
    <span className="text-sm dnd-body">None</span>
  );
};

const getRaceTraits = (
  character: CharacterListItem,
  filterCondition: string,
  not?: string,
) => {
  const traits = getRace(character.raceData.race)?.entries;
  if (traits) {
    const relevantEntryNames = search(traits, [filterCondition], not).map(
      (entry: any, i) => entry.name,
    );

    const relevantTraits = traits.filter(trait =>
      relevantEntryNames.includes(trait.name),
    );

    const lastIndex = relevantTraits.length - 1;
    return lastIndex >= 0 ? (
      relevantTraits.map((trait, i) => (
        <DetailedEntryTrigger
          key={trait.name}
          data={trait}
          extraClassName="inline mr-0.5 text-sm dnd-body"
        >
          {i === lastIndex ? `${trait.name}` : `${trait.name}, `}
        </DetailedEntryTrigger>
      ))
    ) : (
      <span className="text-sm dnd-body">None</span>
    );
  }
  return <div>None</div>;
};

const getSpellsByCastingTime = (
  character: CharacterListItem,
  spells: SpellElement[],
  filterCondition: string,
) => {
  const relevantSpells = character.gameData.spells
    .map(sp => getSpellFromList(spells, sp))
    .filter(isDefined)
    .filter(
      sp => sp.time.filter(entry => entry.unit === filterCondition).length,
    );
  const lastIndex = relevantSpells.length - 1;
  return lastIndex >= 0 ? (
    relevantSpells.map((sp, i) => (
      <DetailedEntryTrigger
        key={sp.name}
        extraClassName="tight"
        data={sp}
        renderer={RenderSpell(sp)}
      >
        <div className="flex items-center mr-0.5 dnd-body text-sm">
          <div>{sp.duration[0].concentration ? `${sp.name} ✱` : sp.name}</div>
          <div className="mx-1 text-xs opacity-50">
            {` (${Parser.spLevelToFull(sp.level)})`}
            {i === lastIndex ? `` : `, `}
          </div>
        </div>
      </DetailedEntryTrigger>
    ))
  ) : (
    <span className="text-sm dnd-body">None</span>
  );
};

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
          {getActions(Unit.Action)}
          <div className="mt-2">Class features</div>
          {getClassFeatures(character, ' action ', 'bonus action')}
          <div className="mt-2">Race traits</div>
          {getRaceTraits(character, ' action ', 'bonus action')}
        </ContentBlock>
        <ContentBlock name="bonus action">
          <div>Actions in combat</div>
          {getActions(Unit.Bonus)}
          {isSpellCasterClass && (
            <>
              <div className="mt-2">Spells</div>
              <div className="dnd-body flex">
                {getSpellsByCastingTime(character, getSpells()!, 'bonus')}
              </div>
            </>
          )}
          <div className="mt-2">Class features</div>
          {getClassFeatures(character, 'bonus action')}
          <div className="mt-2">Race traits</div>
          {getRaceTraits(character, 'bonus action')}
        </ContentBlock>
        <ContentBlock name="reaction">
          <div>Actions in combat</div>
          {getActions(Unit.Reaction)}
          {isSpellCasterClass && (
            <>
              <div>Spells</div>
              <div className="dnd-body flex">
                {getSpellsByCastingTime(character, getSpells()!, 'reaction')}
              </div>
            </>
          )}
          <div className="mt-2">Class features</div>
          {getClassFeatures(character, 'reaction')}
          <div className="mt-2">Race traits</div>
          {getRaceTraits(character, 'reaction')}
        </ContentBlock>
      </PillFilter>
    </>
  );
};

export default Actions;
