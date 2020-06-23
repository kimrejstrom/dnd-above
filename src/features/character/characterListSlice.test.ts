import characterListSliceReducer, {
  longRest,
  DEAFULT_CHARACTER,
  DEFAULT_ID,
  removeDefense,
  DefenseType,
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
                1: { used: 1 },
                2: { used: 2 },
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
            1: { used: 0 },
            2: { used: 0 },
          },
        },
      },
    ]);
  });

  it('should handle removeDefense', () => {
    expect(
      characterListSliceReducer(
        [
          {
            ...DEAFULT_CHARACTER,
            gameData: {
              ...DEAFULT_CHARACTER.gameData,
              defenses: [
                { type: DefenseType.Immunity, name: 'cold' },
                { type: DefenseType.Vulnerability, name: 'cold' },
              ],
            },
          },
        ],
        {
          type: removeDefense.type,
          payload: {
            id: DEFAULT_ID,
            data: { type: DefenseType.Immunity, name: 'cold' },
          },
        },
      ),
    ).toEqual([
      {
        ...DEAFULT_CHARACTER,
        gameData: {
          ...DEAFULT_CHARACTER.gameData,
          defenses: [{ type: DefenseType.Vulnerability, name: 'cold' }],
        },
      },
    ]);
  });
});
