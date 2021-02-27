import characterListSliceReducer, {
  longRest,
  removeDefense,
  DefenseType,
  CharacterListItem,
  CharacterList,
} from './characterListSlice';

const DEFAULT_ID = 'id-DEFAULT';
const DEAFULT_CHARACTER: CharacterListItem = {
  id: DEFAULT_ID,
  allSources: false,
  raceData: {
    race: 'Human',
    chosenRaceAbilities: [],
    standardRaceAbilities: [
      {
        str: 1,
        dex: 1,
        con: 1,
        int: 1,
        wis: 1,
        cha: 1,
      },
    ],
    chosenRaceSkillProficiencies: [],
    standardRaceSkillProficiencies: [],
    chosenRaceLanguages: ['celestial'],
    standardRaceLanguages: ['common'],
  },
  classData: {
    classElement: 'Fighter',
    subClass: 'Champion',
    chosenClassSkillProficiencies: ['acrobatics', 'athletics'],
    standardClassArmorProficiencies: ['light', 'medium', 'heavy', 'shields'],
    standardClassWeaponProficiencies: ['simple', 'martial'],
    standardClassToolProficiencies: [],
    abilityScores: {
      rollMethod: 'standard',
      str: 15,
      dex: 13,
      con: 14,
      int: 10,
      wis: 8,
      cha: 12,
    },
  },
  descriptionData: {
    name: 'Regdar Ridgeheart',
    background: 'Acolyte',
    alignment: 'LG',
    characteristicsSource: 'Acolyte',
    imageUrl: '/img/races/human.png',
    hair: 'Blonde',
    skin: 'Fair',
    eyes: 'Brown',
    height: '193',
    weight: '89',
    age: '34',
    backstory:
      'You squired for a knight who taught you how to fight, care for a steed, and conduct yourself with honor. You decided to take up that path for yourself.\n\nMan-at-arms: You were the member of an elite cavalry unit of an army, trained in heavy armor and a variety of weapons to charge the enemy and crush the opposition.',
    chosenBackgroundSkillProficiencies: [],
    standardBackgroundSkillProficiencies: ['insight', 'religion'],
    chosenBackgroundToolProficiencies: [],
    standardBackgroundToolProficiencies: [],
    chosenBackgroundLanguages: ['dwarvish', 'halfling'],
    standardBackgroundLanguages: [],
    characteristicsPersonalityTrait:
      "I idolize a particular hero of my faith, and constantly refer to that person's deeds and example.",
    characteristicsIdeal:
      'Charity. I always try to help those in need, no matter what the personal cost. (Good)',
    characteristicsBond: 'Everything I do is for the common people.',
    characteristicsFlaw:
      'Once I pick a goal, I become obsessed with it to the detriment of everything else in my life.',
  },
  equipmentData: {
    items: ['Longsword', 'Chain Mail', 'Shield', 'Arrows (20)'],
  },
  customData: {
    customAbilities: [],
    customSkillProficiencies: [],
    customArmorProficiencies: [],
    customWeaponProficiencies: [],
    customToolProficiencies: [],
    customLanguages: [],
  },
  gameData: {
    level: 1,
    feats: [],
    conditions: ['invisible'],
    defenses: [{ type: DefenseType.Immunity, name: 'cold' }],
    spells: [],
    attunements: [],
    actions: [],
    extras: [],
    ac: 0,
    currentHp: 12,
    currentHd: 1,
  },
};

describe('characterListSlice Reducer', () => {
  let initialState: CharacterList;
  const UPDATED_AT = 1614439809072;
  beforeEach(() => {
    initialState = {
      id: 'testListId',
      loading: 'idle',
      list: [DEAFULT_CHARACTER],
      updatedAt: UPDATED_AT,
    };
  });
  it('should handle longRest', () => {
    const newList = characterListSliceReducer(
      {
        ...initialState,
        list: [
          {
            ...initialState.list[0],
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
      },
      {
        type: longRest.type,
        payload: {
          id: DEFAULT_ID,
        },
      },
    ).list;
    expect(newList).toEqual([
      {
        ...initialState.list[0],
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
    const newList = characterListSliceReducer(
      {
        ...initialState,
        list: [
          {
            ...initialState.list[0],
            gameData: {
              ...DEAFULT_CHARACTER.gameData,
              defenses: [
                { type: DefenseType.Immunity, name: 'cold' },
                { type: DefenseType.Vulnerability, name: 'cold' },
              ],
            },
          },
        ],
      },
      {
        type: removeDefense.type,
        payload: {
          id: DEFAULT_ID,
          data: { type: DefenseType.Immunity, name: 'cold' },
        },
      },
    ).list;
    expect(newList).toEqual([
      {
        ...initialState.list[0],
        gameData: {
          ...DEAFULT_CHARACTER.gameData,
          defenses: [{ type: DefenseType.Vulnerability, name: 'cold' }],
        },
      },
    ]);
  });
});
