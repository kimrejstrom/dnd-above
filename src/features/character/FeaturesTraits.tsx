import React from 'react';
import { CharacterState } from 'features/character/characterListSlice';
import { PurpleEntry, ClassFeature } from 'models/class';
import { RaceEntry } from 'models/race';
import Entry from 'components/Entry/Entry';
import { getClass, getRace } from 'utils/character';
import { ThemeMode } from 'features/theme/themeSlice';
import characterDark from 'images/character-dark.png';
import characterLight from 'images/character-light.png';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';

interface Props {
  character: CharacterState;
}

const renderClassFeatures = (classFeatures: ClassFeature[][]) => {
  return classFeatures.map((feature, level) => {
    return (
      <div className="dnd-body">
        {feature.map(feat => {
          return (
            <div className="custom-border custom-border-thin p-4 my-2">
              <div className="font-bold">{`Level ${level + 1} – ${
                feat.name
              }:`}</div>
              {feat.entries.map(entry => {
                return <Entry entry={entry} />;
              })}
            </div>
          );
        })}
      </div>
    );
  });
};

const renderRaceTraits = (raceTraits: RaceEntry[] = []) => {
  return raceTraits.map(trait => {
    return (
      <ul className="dnd-body">
        {trait.entries.map(entry => {
          return (
            <li>
              <Entry entry={entry as PurpleEntry} />
            </li>
          );
        })}
      </ul>
    );
  });
};

const FeaturesTraits = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  const classElement = getClass(character.classData.classElement);
  const race = getRace(character.raceData.race);
  return (
    <div>
      <div
        className="w-full my-2 relative bg-contain bg-center bg-no-repeat"
        style={{
          height: '4rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? characterLight : characterDark
          })`,
        }}
      ></div>
      <div className="text-xl">{classElement!.name} features</div>
      {renderClassFeatures(classElement!.classFeatures)}
      <div className="text-xl">{race!.name} traits</div>
      {renderRaceTraits(race!.entries)}
    </div>
  );
};

export default FeaturesTraits;
