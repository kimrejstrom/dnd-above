import React from 'react';
import { CharacterState } from 'features/character/characterSlice';
import { getClass } from 'utils/character';

interface Props {
  character: CharacterState;
}

const Proficiencies = ({ character }: Props) => {
  const classElement = getClass(character.classData.classElement);
  return (
    <div className="custom-border w-full px-2">
      <div className="text-xl text-center leading-none mt-1 mb-2">
        Proficiencies &amp; Languages
      </div>
      <div>
        {Object.entries(classElement!.startingProficiencies).map(
          ([key, value]) => {
            return (
              <div className="flex flex-col my-2">
                <div className="text-xl">{key}</div>
                <div className="dnd-body">
                  {/* TODO: make sure character has only strings here */}
                  {value
                    .filter((entry: any) => (entry = typeof entry === 'string'))
                    .join(', ')}
                </div>
                <div className="mt-1 w-full border-b-2 border-primary-dark dark:border-primary-light"></div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
};

export default Proficiencies;
