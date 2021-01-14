import React, { useState, useEffect } from 'react';
import { DiceResult } from 'vendor/nicer-dicer-engine';
import { Alert } from 'components/Alert/Alert';
import { RollResult } from 'features/rollResult/RollResult';
import { useDispatch, useSelector } from 'react-redux';
import { addRoll, setCurrentRoll } from 'features/rollInput/rollInputSlice';
import { RollList } from 'features/rollList/RollList';
import { RootState } from 'app/rootReducer';
import { useQuery } from 'utils/customHooks';
import Loader from 'components/Loader/Loader';
import { diceRoller } from 'utils/dice';

export const RollInput = () => {
  const dispatch = useDispatch();

  const [result, setResult] = useState<DiceResult>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  // Get currentRoll from Redux
  const { currentRoll, rolls } = useSelector((state: RootState) => state.rolls);
  const { animations } = useSelector((state: RootState) => state.settings);
  const query = useQuery();

  useEffect(() => {
    const rollQuery = query.get('roll');
    if (rollQuery && !rolls.length) {
      const queryRoll = decodeURIComponent(rollQuery);
      dispatch(setCurrentRoll(queryRoll));
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const rollResult = diceRoller.roll(currentRoll);
      if (animations) {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1600));
        setLoading(false);
      }
      setResult(rollResult);
      setError(undefined);
      dispatch(addRoll(currentRoll));
    } catch (error) {
      setError(error);
    }
  };

  // Render
  return (
    <div className="m-auto py-4">
      <div className="flex flex-col items-center">
        <form className="text-center w-full mb-4" onSubmit={handleSubmit}>
          <label htmlFor="formula-input" className="text-3xl">
            <span>Enter formula</span>
          </label>
          <input
            id="formula-input"
            className="text-lg w-full appearance-none font-mono flex bg-light-100 dark:bg-dark-100 text-center font-bold py-2 px-4 rounded mt-2 border border-dark-100 dark:border-light-100 focus:outline-none focus:border-yellow-400"
            type="text"
            value={currentRoll}
            onChange={e => dispatch(setCurrentRoll(e.target.value))}
          />

          <input
            className="dark:hover:bg-dark-100 bg-light-100 dark:bg-transparent w-full text-2xl py-1 mt-2 px-4 border border-dark-100 dark:border-light-100 rounded"
            type="submit"
            value="Roll"
            disabled={loading}
          />
        </form>
        <div className="w-full text-wrap">
          {error ? (
            <div className="font-mono mb-6 m-auto">
              <Alert title={'Something went wrong'} body={error.message} />
            </div>
          ) : (
            <>
              {loading && animations && <Loader />}
              {result && !loading && <RollResult result={result} />}
              <RollList />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
