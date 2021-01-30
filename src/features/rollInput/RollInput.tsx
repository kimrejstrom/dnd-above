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
import StyledButton from 'components/StyledButton/StyledButton';
import { toggleModal } from 'components/Modal/modalSlice';
import { Info } from 'components/Info/Info';

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
          <button
            className="ml-2"
            type="button"
            onClick={() =>
              dispatch(
                toggleModal({
                  visible: true,
                  title: 'How to roll',
                  content: <Info />,
                }),
              )
            }
          >
            <svg
              className="fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM10.59 8.59a1 1 0 1 1-1.42-1.42 4 4 0 1 1 5.66 5.66l-2.12 2.12a1 1 0 1 1-1.42-1.42l2.12-2.12A2 2 0 0 0 10.6 8.6zM12 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </svg>
          </button>
          <input
            id="formula-input"
            type="text"
            className="form-input text-lg w-full rounded font-mono text-center font-bold mt-2"
            value={currentRoll}
            onChange={e => dispatch(setCurrentRoll(e.target.value))}
          />

          <StyledButton
            extraClassName="w-full mt-2 h-12 md:text-xl"
            type="submit"
            disabled={loading}
          >
            Roll
          </StyledButton>
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
