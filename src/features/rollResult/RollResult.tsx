import React from 'react';
import { DiceResult } from 'vendor/nicer-dicer-engine';

export const RollResult: React.FC<{ result: DiceResult }> = ({ result }) => {
  // Parse Difficulty
  const renderedResult = result.renderedExpression.split('|').filter(e => e);
  const difficulty = {
    hasDifficulty: renderedResult.length > 1,
    expression: renderedResult[1],
  };
  // Parse Rolls
  const rolls = renderedResult[0]
    .split('}')
    .filter(e => e)[0]
    .replace(/[{}]/g, '')
    .split(';');

  // Render
  return (
    <div className="m-auto">
      <div className="mb-4">
        <div className="m-auto flex items-center justify-center text-lg">
          <div className="p-2">
            Total: <b className="text-2xl">{result.total}</b>
          </div>
          {difficulty.hasDifficulty && (
            <>
              <div className="p-2">
                Successes:{' '}
                <b className="text-2xl text-green-600 dark:text-green-300">
                  {result.successes}
                </b>
              </div>
              <div className="p-2">
                Failures:{' '}
                <b className="text-2xl text-red-600 dark:text-red-300">
                  {result.failures}
                </b>
              </div>
            </>
          )}
        </div>
        <div className="m-auto text-center tracking-tight font-mono p-4 dark:bg-dark-200 rounded">
          {difficulty.hasDifficulty && (
            <div key="target" className="font-bold mb-4">
              <span className="border-b-2 dark:border-light-100">
                {difficulty.expression}
              </span>
            </div>
          )}
          <div key="rolls" className="text-center">
            {rolls.map((roll, index) => (
              <span key={index}>
                {roll}
                <br />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
