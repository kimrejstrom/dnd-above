import React from 'react';
import { CharacterState } from 'features/character/characterListSlice';
import { ClassFeature, SubclassFeature } from 'models/class';
import { Race } from 'models/race';
import { getClass, getRace, getSubClass, getFeat } from 'utils/character';
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

interface Props {
  character: CharacterState;
}

const renderClassFeatures = (classFeatures: ClassFeature[][]) => {
  return classFeatures.map((feature, level) => {
    return (
      <div>
        {feature.map(feat => {
          if (feat.source !== 'UAClassFeatureVariants') {
            return (
              <div
                key={feat.name}
                className="custom-border custom-border-thin my-2"
              >
                <DetailedEntryTrigger data={feat} extraClassName="font-bold">
                  {`Level ${level + 1} – ${feat.name}`}
                </DetailedEntryTrigger>
              </div>
            );
          } else {
            return undefined;
          }
        })}
      </div>
    );
  });
};

const renderSubClassFeatures = (classFeatures: SubclassFeature[][]) => {
  return classFeatures.map((feature, i) => {
    const actualFeatures = feature[0].entries;
    return (
      <div key={i}>
        {actualFeatures.map(feat => {
          if (typeof feat !== 'string') {
            return (
              <div
                key={feat.name}
                className="custom-border custom-border-thin my-2"
              >
                <DetailedEntryTrigger data={feat} extraClassName="font-bold">
                  {feat.name}
                </DetailedEntryTrigger>
              </div>
            );
          } else {
            return undefined;
          }
        })}
      </div>
    );
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
    <p>No racial traits</p>
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
      <PillFilter pills={['class features', 'race features', 'feats']}>
        <ContentBlock name="class features">
          <div className="text-lg">{classElement!.name} features</div>
          {renderClassFeatures(classElement!.classFeatures)}
          <div className="text-lg">{subClassElement!.name} features</div>
          {renderSubClassFeatures(subClassElement!.subclassFeatures)}
        </ContentBlock>
        <ContentBlock name="race features">
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
