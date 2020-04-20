import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { updateFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import * as _ from 'lodash';
import { Dice } from 'vendor/nicer-dicer-engine';
import TextBox from 'components/TextBox/TextBox';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import mainRenderer from 'utils/mainRenderer';
import { getClassQuickBuild, getRace, getClass } from 'utils/character';
import { isDefined } from 'ts-is-present';

const Abilities = ({ url }: { url: string }) => {
  const dispatch = useDispatch();
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );
  const history = useHistory();
  const { register, handleSubmit, getValues, errors } = useForm<FormData>();
  const onSubmit = (data: FormData, e?: React.BaseSyntheticEvent) => {
    const parsedData = {
      rollMethod: data.rollMethod,
      str: Number(data.str),
      dex: Number(data.dex),
      con: Number(data.con),
      int: Number(data.int),
      wis: Number(data.wis),
      cha: Number(data.cha),
    };
    dispatch(updateFormData({ classData: { abilityScores: parsedData } }));
    history.push(`${url}/step-4`);
  };

  type FormData = {
    rollMethod: string;
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };

  type AbilityScore = {
    score: number;
    used: boolean;
  };

  const race = getRace(formState.data.raceData.race);
  const classElement = getClass(formState.data.classData.classElement);

  const [abilityScores, setAbilityScores] = useState<AbilityScore[]>(
    Object.values(formState.data.classData.abilityScores)
      .map(score =>
        typeof score === 'number' ? { score, used: false } : undefined,
      )
      .filter(isDefined),
  );

  const getRacialBonus = (key: string) => {
    const standardRaceBonus = race?.ability
      ? (race?.ability[0] as any)[key]
        ? (race?.ability[0] as any)[key]
        : 0
      : 0;
    const chosenBonus = formState.data.raceData.chosenRaceAbilities.length
      ? (formState.data.raceData.chosenRaceAbilities[0] as any)[key]
        ? (formState.data.raceData.chosenRaceAbilities[0] as any)[key]
        : 0
      : 0;
    return Number(standardRaceBonus) + Number(chosenBonus);
  };

  const getBaseScore = (key: string) => Number((getValues() as any)[key] || 0);

  const handleScoreSelect = (
    e: React.SyntheticEvent<HTMLSelectElement, Event>,
  ) => {
    const toBeReplaced = _.findIndex(
      abilityScores,
      ab => ab.score === Number(e.currentTarget.value) && ab.used === false,
    );
    setAbilityScores(
      abilityScores.map((ab, i) =>
        i === toBeReplaced ? { ...ab, used: true } : ab,
      ),
    );
  };

  const handleMethodSelect = (
    e: React.SyntheticEvent<HTMLSelectElement, Event>,
  ) => {
    if (e.currentTarget.value === 'standard') {
      setAbilityScores([
        { score: 8, used: false },
        { score: 10, used: false },
        { score: 12, used: false },
        { score: 13, used: false },
        { score: 14, used: false },
        { score: 15, used: false },
      ]);
    } else if (e.currentTarget.value === 'roll') {
      const dice = new Dice(undefined, undefined, {
        renderExpressionDecorators: true,
      });
      const rollResult = dice
        .roll('{4d6kh3...6}')
        .renderedExpression.split('}')
        .filter(e => e)[0]
        .replace(/[{}]/g, '')
        .split(';')
        .map(roll => roll.split('=')[1].trim());
      setAbilityScores(
        rollResult
          .sort((a, b) => Number(a) - Number(b))
          .map(score => ({
            score: Number(score),
            used: false,
          })),
      );
    } else {
      setAbilityScores([]);
    }
  };

  return (
    <div>
      <h1>Step 3: Abilities</h1>
      <div className="flex justify-between my-4">
        <Link
          className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded"
          to={`${url}/step-2`}
        >
          Previous
        </Link>
        <button
          className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded"
          onClick={handleSubmit(onSubmit)}
        >
          Next
        </button>
      </div>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <h2>Ability Scores</h2>
        {formState.data.classData.classElement && (
          <TextBox>
            <DangerousHtml
              data={mainRenderer.render(
                {
                  type: 'entries',
                  entries: getClassQuickBuild(classElement!),
                },
                1,
              )}
            />
          </TextBox>
        )}
        <div className="w-full">
          <label className="block">
            {`Method`}
            <select
              name="rollMethod"
              onChange={handleMethodSelect}
              defaultValue={formState.data.classData.abilityScores.rollMethod}
              ref={register({
                required: true,
                validate: data => data !== 'initial',
              })}
              className={`form-select block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded`}
            >
              <option value="initial">-</option>
              <option value="roll">Roll for stats</option>
              <option value="standard">Standard Array</option>
            </select>
            {errors.rollMethod && <span>{`You must choose a method`}</span>}
          </label>
        </div>
        {abilityScores.length > 0 && (
          <div className="my-4">
            <h4 className="text-center">Scores:</h4>
            <div className="w-full flex justify-center">
              {abilityScores.map(ab => (
                <div
                  className={`${
                    ab.used ? 'opacity-25' : ''
                  } w-10 h-10 mr-2 custom-border custom-border-thin flex flex-col items-center`}
                >
                  <div className={`text-xl leading-tight`}>{ab.score}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex w-full my-4">
          {Object.entries(Parser.ATB_ABV_TO_FULL).map(([key, value]) => (
            <div className="w-1/6 text-center">
              <label className="block mx-1">
                {value}
                <select
                  name={key}
                  onChange={handleScoreSelect}
                  ref={register({
                    required: true,
                    validate: data => data !== '0',
                  })}
                  className={`form-select block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded`}
                >
                  <option value="0">-</option>
                  {abilityScores.map(ab => (
                    <option disabled={ab.used} value={ab.score}>
                      {ab.score}
                    </option>
                  ))}
                </select>
                {(errors as any)[key] && (
                  <span>{`You must choose a score`}</span>
                )}
              </label>
            </div>
          ))}
        </div>
      </form>
      <div className="flex flex-wrap w-full my-4">
        {Object.entries(Parser.ATB_ABV_TO_FULL).map(([key, value]) => (
          <div className="my-4 flex-shrink-0 w-1/3 border-1 border-tertiary-dark">
            <div className="w-full px-4 py-1 bg-primary-dark text-yellow-100">
              {value}
            </div>
            <table className="bg-yellow-100 dark:bg-tertiary-dark w-full rounded border-collapse border border-gray-400 dark:border-primary-dark">
              <tbody>
                <tr>
                  <td className="px-4">Total Score</td>
                  <td className="text-2xl text-center">
                    {getRacialBonus(key) + getBaseScore(key)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4">Base Score</td>
                  <td className="text-2xl text-center">{getBaseScore(key)}</td>
                </tr>
                <tr>
                  <td className="px-4">Racial Bonus</td>
                  <td className="text-2xl text-center">
                    {getRacialBonus(key)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Abilities;
