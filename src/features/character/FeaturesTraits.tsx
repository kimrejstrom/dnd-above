import React from 'react';
import { CharacterListItem } from 'features/character/characterListSlice';
import { getClass, getRace, getSubClass } from 'utils/sourceDataUtils';
import { ThemeMode } from 'features/theme/themeSlice';
import characterDark from 'images/character-dark.png';
import characterLight from 'images/character-light.png';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import PillFilter, { ContentBlock } from 'components/PillFilter/PillFilter';
import {
  renderClassFeatures,
  renderSubClassFeatures,
  renderRaceTraits,
  renderFeats,
} from 'utils/render';
import ClassTable from 'pages/Create/ClassTable';

interface Props {
  character: CharacterListItem;
}

const FeaturesTraits = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  const classElement = getClass(character.classData.classElement);
  const subClassElement = getSubClass(
    character.classData.classElement,
    character.classData.subClass,
  );
  const race = getRace(character.raceData.race);
  return (
    <div>
      <div
        className="w-full mt-2 relative bg-contain bg-center bg-no-repeat"
        style={{
          height: '5rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? characterLight : characterDark
          })`,
        }}
      ></div>
      <PillFilter pills={['class', 'subclass', 'race', 'feats']}>
        <ContentBlock
          name="class"
          heading={`Class - ${classElement!.name} features`}
        >
          <ClassTable cls={classElement!} subcls={subClassElement!} />
          {renderClassFeatures(classElement!.name)}
        </ContentBlock>
        <ContentBlock
          name="subclass"
          heading={`Subclass - ${subClassElement!.name} features`}
        >
          {renderSubClassFeatures(classElement!.name, subClassElement!.name)}
        </ContentBlock>
        <ContentBlock name="race" heading={`Race - ${race!.name} traits`}>
          {renderRaceTraits(race!)}
        </ContentBlock>
        <ContentBlock name="feats">
          {renderFeats(character.gameData.feats)}
        </ContentBlock>
      </PillFilter>
    </div>
  );
};

export default FeaturesTraits;
