import React, { ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import {
  CharacterListItem,
  CHARACTER_STATS,
  StatsTypes,
  updateASI,
} from 'features/character/characterListSlice';
import {
  getAbilityScoreByType,
  getRaceAbilityBonus,
  getAbilityMod,
} from 'utils/character';
import { useForm } from 'react-hook-form';
import { Parser } from 'utils/mainRenderer';

interface Props {
  character: CharacterListItem;
}

const AbilitiesSkillsModal: React.FC<Props> = ({ character }) => {
  const { register } = useForm();
  const abilityScores = character.classData.abilityScores;
  const dispatch = useDispatch();

  const onASIChange = (e: ChangeEvent<HTMLInputElement>, stat: StatsTypes) => {
    dispatch(
      updateASI({
        id: character.id!,
        data: { [stat]: Number(e.currentTarget.value) },
      }),
    );
  };

  return (
    <div>
      <div className="my-2">
        <div className="flex w-full items-center">
          <div className="text-xl mr-2">Base Scores </div>
          <div className="text-sm">({abilityScores.rollMethod}):</div>
        </div>
        <div className="mt-1 mb-2">
          <div className="w-full flex">
            {Object.keys(CHARACTER_STATS).map(key => {
              const score = abilityScores[key as StatsTypes];
              return (
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 mr-2 custom-border custom-border-thin flex flex-col items-center`}
                  >
                    <div className={`text-xl leading-tight`}>{score}</div>
                  </div>
                  <div className="mt-1 mr-2">{key}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="my-2">
        <div className="text-xl">ASIs &amp; Others:</div>
        <div className="flex">
          {Object.entries(CHARACTER_STATS).map(([key, value]) => {
            const customScore = getAbilityScoreByType(
              key as StatsTypes,
              character.customData.customAbilities,
            );
            return (
              <label className="block w-20 mr-2 text-center">
                {key}
                <input
                  name={key}
                  type="number"
                  defaultValue={customScore}
                  className="form-input"
                  ref={register}
                  onChange={e => onASIChange(e, key as StatsTypes)}
                />
              </label>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap w-full my-4">
        {Object.entries(Parser.ATB_ABV_TO_FULL).map(([key, value]) => {
          const baseScore = abilityScores[key as StatsTypes];
          const raceScore = getRaceAbilityBonus(character, key as StatsTypes);
          const customScore = getAbilityScoreByType(
            key as StatsTypes,
            character.customData?.customAbilities,
          );
          const totalScore = baseScore + raceScore + customScore;
          return (
            <div className="my-4 flex-shrink-0 w-1/3 border-1 border-dark-300">
              <div className="w-full px-4 py-1 bg-dark-100 text-yellow-100">
                {value as any}
              </div>
              <table className="bg-light-100 dark:bg-dark-300 w-full rounded border-collapse border border-gray-400 dark:border-dark-100">
                <tbody>
                  <tr>
                    <td className="px-4">Total Score</td>
                    <td className="text-2xl text-center">
                      {raceScore + baseScore + customScore}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4">Modifier</td>
                    <td className="text-2xl text-center">
                      {getAbilityMod(totalScore)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4">Base Score</td>
                    <td className="text-2xl text-center">{baseScore}</td>
                  </tr>
                  <tr>
                    <td className="px-4">Racial Bonus</td>
                    <td className="text-2xl text-center">{raceScore}</td>
                  </tr>
                  <tr>
                    <td className="px-4">Other Bonus</td>
                    <td className="text-2xl text-center">{customScore}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AbilitiesSkillsModal;
