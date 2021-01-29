import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { updateFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import * as _ from 'lodash';
import TextBox from 'components/TextBox/TextBox';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import { Parser, mainRenderer } from 'utils/mainRenderer';
import { getClassQuickBuild } from 'utils/character';
import { getRace, getClass } from 'utils/sourceDataUtils';
import { isDefined } from 'ts-is-present';
import StyledButton, {
  DEFAULT_BUTTON_STYLE,
} from 'components/StyledButton/StyledButton';
import { diceRoller } from 'utils/dice';
import { StatsTypes } from 'features/character/characterListSlice';

const Abilities = () => {
  const dispatch = useDispatch();
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );
  const history = useHistory();
  const { register, handleSubmit, setValue, watch, errors } = useForm<
    FormData
  >();
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
    history.push(`/create/step-4`);
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

  useEffect(() => {
    Object.entries(formState.data.classData.abilityScores).forEach(
      ([key, value]) => {
        if (value !== 0) {
          setValue(key as StatsTypes, value);
        }
      },
    );
  }, [setValue, formState.data.classData.abilityScores]);

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

  const getBaseScore = (key: string) => {
    return Number((watch() as any)[key] || 0);
  };

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

  const rollAbilityScores = () => {
    const rollResult = diceRoller
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
    } else if (e.currentTarget.value === 'rolled') {
      rollAbilityScores();
    } else {
      setAbilityScores([]);
    }
  };

  return (
    <div>
      <h1>Step 3: Abilities</h1>
      <div className="flex justify-between my-4">
        <Link className={DEFAULT_BUTTON_STYLE} to={`/create/step-2`}>
          Previous
        </Link>
        <div className="flex relative">
          <h1>Ability Scores</h1>
        </div>
        <StyledButton onClick={handleSubmit(onSubmit)}>Next</StyledButton>
      </div>
      <TextBox>
        {formState.data.classData.classElement && (
          <DangerousHtml
            data={mainRenderer.render(
              {
                type: 'entries',
                entries: getClassQuickBuild(classElement!),
              },
              1,
            )}
          />
        )}
        <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
          <div className="w-full">
            <label className="block">
              {`Method`}
              <select
                name="rollMethod"
                onChange={handleMethodSelect}
                defaultValue={formState.data.classData.abilityScores.rollMethod}
                ref={register({
                  required: true,
                  validate: (data: any) => data !== 'initial',
                })}
                className="form-input"
              >
                <option value="initial">-</option>
                <option value="rolled">Roll for stats</option>
                <option value="standard">Standard Array</option>
              </select>
              {errors.rollMethod && (
                <span className="form-error">{`You must choose a method`}</span>
              )}
            </label>
          </div>
          {abilityScores.length > 0 && (
            <div className="my-4 dnd-header">
              <h4 className="text-center">Scores:</h4>
              <div className="w-full flex justify-center">
                {abilityScores.map((ab, i) => (
                  <div
                    key={i}
                    className={`${
                      ab.used ? 'opacity-25' : ''
                    } w-10 h-10 mr-2 custom-border-xs custom-border-thin flex flex-col items-center bg-gray-100 dark:bg-dark-200`}
                  >
                    <div className={`text-xl leading-tight`}>{ab.score}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <StyledButton
                  extraClassName="w-36 mr-2"
                  onClick={e => {
                    e?.preventDefault();
                    const shuffledScores = _.shuffle(abilityScores);
                    Object.keys(Parser.ATB_ABV_TO_FULL).forEach((key, i) => {
                      setValue(key as StatsTypes, shuffledScores[i].score);
                    });
                  }}
                >
                  Auto-assign
                </StyledButton>
                <StyledButton
                  extraClassName="w-36 ml-2"
                  onClick={e => {
                    e?.preventDefault();
                    rollAbilityScores();
                  }}
                >
                  Re-roll
                </StyledButton>
              </div>
            </div>
          )}

          <div className="flex w-full my-4">
            {Object.entries(Parser.ATB_ABV_TO_FULL).map(([key, value]) => (
              <div key={key} className="w-1/6 text-center">
                <label className="block mx-1">
                  {value}
                  <select
                    name={key}
                    onChange={handleScoreSelect}
                    ref={register({
                      required: true,
                      validate: (data: any) => data !== '0',
                    })}
                    className={`form-input`}
                  >
                    <option value="0">-</option>
                    {abilityScores.map((ab, i) => (
                      <option key={i} disabled={ab.used} value={ab.score}>
                        {ab.score}
                      </option>
                    ))}
                  </select>
                  {(errors as any)[key] && (
                    <span className="form-error">{`Required`}</span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </form>
        <div className="flex flex-wrap w-full my-4">
          {Object.entries(Parser.ATB_ABV_TO_FULL).map(([key, value]) => (
            <div
              key={key}
              className="dnd-header my-4 flex-shrink-0 w-1/3 border-1 border-dark-300"
            >
              <div className="w-full px-4 py-1 bg-dark-100 text-yellow-100">
                {value as any}
              </div>
              <table className="bg-light-100 dark:bg-dark-300 w-full rounded border-collapse border border-gray-400 dark:border-dark-100">
                <tbody>
                  <tr>
                    <td className="px-4">Total Score</td>
                    <td className="text-2xl text-center">
                      {getRacialBonus(key) + getBaseScore(key)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4">Base Score</td>
                    <td className="text-2xl text-center">
                      {getBaseScore(key)}
                    </td>
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
      </TextBox>
    </div>
  );
};

export default Abilities;
