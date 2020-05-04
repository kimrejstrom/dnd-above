import characterListSliceReducer, {
  longRest,
  DEAFULT_CHARACTER,
  DEFAULT_ID,
} from './characterListSlice';

describe('characterListSlice Reducer', () => {
  it('should handle longRest', () => {
    expect(
      characterListSliceReducer(
        [
          {
            ...DEAFULT_CHARACTER,
            gameData: {
              ...DEAFULT_CHARACTER.gameData,
              currentHd: 1,
              spellSlots: {
                1: { used: 1, total: 3 },
                2: { used: 2, total: 2 },
              },
            },
          },
        ],
        {
          type: longRest.type,
          payload: {
            id: DEFAULT_ID,
          },
        },
      ),
    ).toEqual([
      {
        ...DEAFULT_CHARACTER,
        gameData: {
          ...DEAFULT_CHARACTER.gameData,
          currentHd: 1,
          currentHp: 12,
          spellSlots: {
            1: { used: 0, total: 3 },
            2: { used: 0, total: 2 },
          },
        },
      },
    ]);
  });
});
