import React from 'react';
import { CharacterState } from 'features/character/characterListSlice';
import { Race } from 'models/race';
import {
  getClass,
  getRace,
  getSubClass,
  getFeat,
  getClassFeatures,
  getSubClassFeatures,
} from 'utils/character';
import { ThemeMode } from 'features/theme/themeSlice';
import characterDark from 'images/character-dark.png';
import characterLight from 'images/character-light.png';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import PillFilter, { ContentBlock } from 'components/PillFilter/PillFilter';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import { mainRenderer } from 'utils/mainRenderer';
import { setDetailedEntry } from 'features/detailedEntry/detailedEntrySlice';
import _ from 'lodash';
import ClassTable from 'pages/Create/ClassTable';

interface Props {
  character: CharacterState;
}

const renderClassFeatures = (className: string) => {
  const classFeatures = getClassFeatures(className);
  return classFeatures.map(feature => {
    if (!feature.source.includes('UA')) {
      return (
        <div
          key={`${feature.name}-${feature.level}`}
          className="custom-border custom-border-thin my-2"
        >
          <DetailedEntryTrigger data={feature} extraClassName="font-bold">
            {`Level ${feature.level} – ${feature.name}`}
          </DetailedEntryTrigger>
        </div>
      );
    } else {
      return undefined;
    }
  });
};

const renderSubClassFeatures = (className: string, subClassName: string) => {
  const subclassFeatures = getSubClassFeatures(className, subClassName);
  return subclassFeatures.map(feature => {
    if (!feature.source.includes('UA')) {
      return (
        <div
          key={`${feature.name}-${feature.level}`}
          className="custom-border custom-border-thin my-2"
        >
          <DetailedEntryTrigger data={feature} extraClassName="font-bold">
            {`Level ${feature.level} – ${feature.name}`}
          </DetailedEntryTrigger>
        </div>
      );
    } else {
      return undefined;
    }
  });
};

const renderRaceTraits = (race: Race) => {
  const raceTraits = race.entries?.filter(
    item => !_.includes(['Age', 'Size', 'Alignment', 'Languages'], item.name),
  );
  return raceTraits?.length ? (
    raceTraits?.map(trait => (
      <DetailedEntryTrigger data={trait}>
        <div key={trait.name} className="custom-border custom-border-thin my-2">
          {trait.name}
        </div>
      </DetailedEntryTrigger>
    ))
  ) : (
    <p>No racial traits</p>
  );
};

const renderFeats = (feats: string[]) => {
  return feats?.length ? (
    feats?.map(featName => {
      const feat = getFeat(featName);
      return (
        <DetailedEntryTrigger data={feat}>
          <div
            key={feat?.name}
            className="custom-border custom-border-thin my-2"
          >
            {feat?.name}
          </div>
        </DetailedEntryTrigger>
      );
    })
  ) : (
    <p>No feats</p>
  );
};

const FeaturesTraits = ({ character }: Props) => {
  const dispatch = useDispatch();
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
        className="w-full my-2 relative bg-contain bg-center bg-no-repeat"
        style={{
          height: '5rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? characterLight : characterDark
          })`,
        }}
      ></div>
      <PillFilter pills={['table', 'class', 'race', 'feats']}>
        <ContentBlock name="table">
          <ClassTable cls={classElement!} subcls={subClassElement!} />
        </ContentBlock>
        <ContentBlock name="class">
          <div className="text-lg">{classElement!.name} features</div>
          {renderClassFeatures(classElement!.name)}
          <div className="text-lg">{subClassElement!.name} features</div>
          {renderSubClassFeatures(classElement!.name, subClassElement!.name)}
        </ContentBlock>
        <ContentBlock name="race">
          <div
            className="text-lg cursor-pointer"
            onClick={() =>
              dispatch(
                setDetailedEntry(
                  <DangerousHtml
                    data={mainRenderer.race.getCompactRenderedString(race)}
                  />,
                ),
              )
            }
          >
            {race!.name} traits
          </div>
          {renderRaceTraits(race!)}
        </ContentBlock>
        <ContentBlock name="feats">
          <div className="text-lg">Feats</div>
          {renderFeats(character.gameData.feats)}
        </ContentBlock>
      </PillFilter>
    </div>
  );
};

export default FeaturesTraits;
