import React from 'react';
import { CharacterState } from 'features/character/characterSlice';
import { PurpleEntry, ClassFeature } from 'models/class';
import { RaceEntry } from 'models/race';
import Entry from 'components/Entry/Entry';

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
  return (
    <div>
      <div className="text-xl">{character.class.name} features</div>
      {renderClassFeatures(character.class.classFeatures)}
      <div className="text-xl">{character.race.name} traits</div>
      {renderRaceTraits(character.race.entries)}
    </div>
  );
};

export default FeaturesTraits;
