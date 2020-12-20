import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CreateCharacterFormState } from 'features/createCharacterForm/createCharacterFormSlice';
import { SkillTypes } from 'features/character/Skills';
import { ArmorEnum, ClassElement } from 'models/class';
import {
  getRace,
  getClass,
  getBackground,
  getIncludedProficiencies,
  getAbilityMod,
  calculateStats,
  getMaxHP,
  getHitDice,
  isSpellCaster,
  mapArmorProficiencies,
} from 'utils/character';
import _ from 'lodash';
import { AbilityBase, Race } from 'models/race';
import { getCookie } from 'utils/cookie';
import { diceRoller } from 'utils/dice';
import {
  PLAYABLE_RACES,
  PLAYABLE_CLASSES,
  BACKGROUNDS,
  filterSources,
  WEAPONS,
  ALL_OTHER_ITEMS,
  ARMOR,
} from 'utils/data';
import { BackgroundElement } from 'models/background';
import { Parser } from 'utils/mainRenderer';
import { generate_name } from 'utils/name';
import { RootState } from 'app/rootReducer';
import { AppDispatch } from 'app/store';
import DnDAboveAPI from 'utils/api';

export const CHARACTER_STATS = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

export type StatsTypes = keyof typeof CHARACTER_STATS;

export interface CharacterBase {
  id: string;
  raceData: {
    race: string;
    chosenRaceAbilities: AbilityBase[];
    standardRaceAbilities: AbilityBase[];
    chosenRaceSkillProficiencies: SkillTypes[];
    standardRaceSkillProficiencies: SkillTypes[];
    chosenRaceLanguages: string[];
    standardRaceLanguages: string[];
  };
  classData: {
    classElement: string;
    subClass: string;
    chosenClassSkillProficiencies: SkillTypes[];
    standardClassArmorProficiencies: string[];
    standardClassWeaponProficiencies: string[];
    standardClassToolProficiencies: string[];
    abilityScores: Record<StatsTypes, number> & { rollMethod: string };
  };
  descriptionData: {
    name: string;
    background: string;
    alignment: string;
    characteristicsSource: string;
    imageUrl: string;
    hair: string;
    skin: string;
    eyes: string;
    height: string;
    weight: string;
    age: string;
    backstory: string;
    chosenBackgroundSkillProficiencies: SkillTypes[];
    standardBackgroundSkillProficiencies: SkillTypes[];
    chosenBackgroundToolProficiencies: string[];
    standardBackgroundToolProficiencies: string[];
    chosenBackgroundLanguages: string[];
    standardBackgroundLanguages: string[];
    characteristicsPersonalityTrait: string;
    characteristicsIdeal: string;
    characteristicsBond: string;
    characteristicsFlaw: string;
  };
  equipmentData: {
    items: string[];
  };
}

export interface CharacterCustom {
  allSources: boolean;
  customData: {
    customAbilities: AbilityBase[];
    customSkillProficiencies: SkillTypes[];
    customArmorProficiencies: Array<ArmorEnum>;
    customWeaponProficiencies: string[];
    customToolProficiencies: string[];
    customLanguages: string[];
  };
}

export enum DefenseType {
  Resistance = 'Resistacne',
  Immunity = 'Immunity',
  Vulnerability = 'Vulnerability',
}

export interface CharacterGameData {
  gameData: {
    level: number;
    feats: string[];
    conditions: string[];
    defenses: { type: DefenseType; name: string }[];
    spells: { row: number; name: string }[];
    attunements: string[];
    actions: any[];
    extras: any[];
    ac: number;
    currentHp: number;
    currentHd: number;
    spellSlots?: Record<
      number,
      {
        used: number;
      }
    >;
  };
}

export type CharacterListItem = CharacterBase &
  CharacterCustom &
  CharacterGameData;
// export interface CharacterListItem extends CharacterState {
//   id: string;
// }
export type CharacterList = {
  id: string;
  loading: 'idle' | 'pending' | 'error';
  list: Array<CharacterListItem>;
  error?: string;
};
// export const DEFAULT_ID = 'id-DEFAULT';
// export const DEAFULT_CHARACTER: CharacterListItem = {
//   id: DEFAULT_ID,
//   allSources: false,
//   raceData: {
//     race: 'Human',
//     chosenRaceAbilities: [],
//     standardRaceAbilities: [
//       {
//         str: 1,
//         dex: 1,
//         con: 1,
//         int: 1,
//         wis: 1,
//         cha: 1,
//       },
//     ],
//     chosenRaceSkillProficiencies: [],
//     standardRaceSkillProficiencies: [],
//     chosenRaceLanguages: ['celestial'],
//     standardRaceLanguages: ['common'],
//   },
//   classData: {
//     classElement: 'Fighter',
//     subClass: 'Champion',
//     chosenClassSkillProficiencies: ['acrobatics', 'athletics'],
//     standardClassArmorProficiencies: ['light', 'medium', 'heavy', 'shields'],
//     standardClassWeaponProficiencies: ['simple', 'martial'],
//     standardClassToolProficiencies: [],
//     abilityScores: {
//       rollMethod: 'standard',
//       str: 15,
//       dex: 13,
//       con: 14,
//       int: 10,
//       wis: 8,
//       cha: 12,
//     },
//   },
//   descriptionData: {
//     name: 'Regdar Ridgeheart',
//     background: 'Acolyte',
//     alignment: 'LG',
//     characteristicsSource: 'Acolyte',
//     imageUrl: '/img/races/human.png',
//     hair: 'Blonde',
//     skin: 'Fair',
//     eyes: 'Brown',
//     height: '193',
//     weight: '89',
//     age: '34',
//     backstory:
//       'You squired for a knight who taught you how to fight, care for a steed, and conduct yourself with honor. You decided to take up that path for yourself.\n\nMan-at-arms: You were the member of an elite cavalry unit of an army, trained in heavy armor and a variety of weapons to charge the enemy and crush the opposition.',
//     chosenBackgroundSkillProficiencies: [],
//     standardBackgroundSkillProficiencies: ['insight', 'religion'],
//     chosenBackgroundToolProficiencies: [],
//     standardBackgroundToolProficiencies: [],
//     chosenBackgroundLanguages: ['dwarvish', 'halfling'],
//     standardBackgroundLanguages: [],
//     characteristicsPersonalityTrait:
//       "I idolize a particular hero of my faith, and constantly refer to that person's deeds and example.",
//     characteristicsIdeal:
//       'Charity. I always try to help those in need, no matter what the personal cost. (Good)',
//     characteristicsBond: 'Everything I do is for the common people.',
//     characteristicsFlaw:
//       'Once I pick a goal, I become obsessed with it to the detriment of everything else in my life.',
//   },
//   equipmentData: {
//     items: ['Longsword', 'Chain Mail', 'Shield', 'Arrows (20)'],
//   },
//   customData: {
//     customAbilities: [],
//     customSkillProficiencies: [],
//     customArmorProficiencies: [],
//     customWeaponProficiencies: [],
//     customToolProficiencies: [],
//     customLanguages: [],
//   },
//   gameData: {
//     level: 1,
//     feats: [],
//     conditions: ['invisible'],
//     defenses: [{ type: DefenseType.Immunity, name: 'cold' }],
//     spells: [],
//     attunements: [],
//     actions: [],
//     extras: [],
//     ac: 0,
//     currentHp: 12,
//     currentHd: 1,
//   },
// };

// const MOE: CharacterListItem = {
//   id: 'id-cb5de106a9e47',
//   allSources: true,
//   raceData: {
//     race: 'Halfling (Ghostwise)',
//     chosenRaceAbilities: [],
//     standardRaceAbilities: [
//       {
//         dex: 2,
//         wis: 1,
//       },
//     ],
//     chosenRaceSkillProficiencies: [],
//     standardRaceSkillProficiencies: [],
//     chosenRaceLanguages: [],
//     standardRaceLanguages: ['common', 'halfling'],
//   },
//   classData: {
//     classElement: 'Druid',
//     subClass: 'Circle of the Shepherd',
//     chosenClassSkillProficiencies: ['insight', 'perception'],
//     standardClassArmorProficiencies: ['light', 'medium', 'shields'],
//     standardClassWeaponProficiencies: [
//       'clubs',
//       'daggers',
//       'darts',
//       'javelins',
//       'maces',
//       'quarterstaffs',
//       'scimitars',
//       'sickles',
//       'slings',
//       'spears',
//     ],
//     standardClassToolProficiencies: [],
//     abilityScores: {
//       rollMethod: 'rolled',
//       str: 8,
//       dex: 15,
//       con: 17,
//       int: 11,
//       wis: 17,
//       cha: 11,
//     },
//   },
//   descriptionData: {
//     name: 'Moe Glee, The Minionmancer',
//     background: 'Far Traveler',
//     alignment: 'CG',
//     characteristicsSource: 'Far Traveler',
//     imageUrl: 'https://i.imgur.com/fX2c9M5.png',
//     hair: 'Orange',
//     skin: 'Greenish',
//     eyes: 'Orange',
//     height: '3ft',
//     weight: '40',
//     age: '19',
//     backstory:
//       'Born to a poor farmer family, Moe remembers very little about his parents. He still sees the flames that took them from him in his dreams, violently raging as they consume the last parts of his childhood home.\nMoe can’t remember how the fire started, but it haunts his dreams - night after night he is tormented by these visions. Again and again the flames erupt out of nowhere and each night he fails to escape them.\nShira, the fey spirit that watched over Moe and his tribe often walks the earth in the form of black panther. She managed to pull Moe from the flames on that fateful night, carrying the small boy to safety. She tried going back in for the others but was blocked by the flames.\nOrphaned, and with no-one of his kin left to care for him, Shira decided to bring the boy with her, deep into the forest where he would live with a new kind of tribe.\nFor fifteen years Moe lived together with the animals as a part of their herd. When Moe was seven Shira brought one of her old friends to the camp, a 250 year old tortle druid named Grok. Together Grok and Shira set out to teach Moe about the power of nature, the Great Balance and about the elements that guide it: the power of tooth and claw, of sun and moon and of fire and storm.\nWhen Moe turned 17, Shira came to Moe with a request. She had sensed a growing power, a darkness somewhere far away, disrupting the Great Balance. A force that seeks to hold sway over nature and life. She sent him on a mission to find out what this force is, and to try and restore the balance to their world.\nSo Moe set off towards the foreign lands of Asteria.',
//     chosenBackgroundSkillProficiencies: [],
//     standardBackgroundSkillProficiencies: ['arcana', 'nature'],
//     chosenBackgroundToolProficiencies: ['gaming set'],
//     standardBackgroundToolProficiencies: [],
//     chosenBackgroundLanguages: ['primordial'],
//     standardBackgroundLanguages: [],
//     characteristicsPersonalityTrait:
//       "I have different assumptions from those around me concerning personal space, blithely invading others' space in innocence, or reacting to ignorant invasion of my own.",
//     characteristicsIdeal:
//       "Adventure. I'm far from home, and everything is strange and wonderful! (Chaotic)",
//     characteristicsBond:
//       'Though I had no choice, I lament having to leave my loved one(s) behind. I hope to see them again one day.',
//     characteristicsFlaw:
//       'I have a weakness for the new intoxicants and other pleasures of this land.',
//   },
//   equipmentData: {
//     items: [
//       'Quarterstaff',
//       'Scimitar',
//       'Leather Armor',
//       'Shield',
//       "Explorer's Pack",
//       'Totem',
//     ],
//   },
//   customData: {
//     customAbilities: [{ wis: 2 }],
//     customSkillProficiencies: [],
//     customArmorProficiencies: [],
//     customWeaponProficiencies: [],
//     customToolProficiencies: [],
//     customLanguages: [],
//   },
//   gameData: {
//     level: 4,
//     feats: ['Resilient'],
//     spells: [
//       {
//         row: 0,
//         name: 'Acid Splash',
//       },
//       {
//         row: 1,
//         name: 'Animal Friendship',
//       },
//       {
//         row: 12,
//         name: 'Call Lightning',
//       },
//       {
//         row: 17,
//         name: 'Conjure Animals',
//       },
//       {
//         row: 40,
//         name: 'Entangle',
//       },
//       {
//         row: 49,
//         name: 'Flaming Sphere',
//       },
//       {
//         row: 56,
//         name: 'Goodberry',
//       },
//       {
//         row: 59,
//         name: 'Guidance',
//       },
//       {
//         row: 80,
//         name: 'Healing Spirit',
//       },
//       {
//         row: 101,
//         name: 'Moonbeam',
//       },
//       {
//         row: 105,
//         name: 'Shillelagh',
//       },
//       {
//         row: 144,
//         name: 'Spike Growth',
//       },
//     ],
//     conditions: ['invisible'],
//     defenses: [{ type: DefenseType.Immunity, name: 'cold' }],
//     attunements: [],
//     actions: [],
//     extras: [],
//     ac: 16,
//     currentHp: 12,
//     currentHd: 5,
//     spellSlots: {
//       1: { used: 0 },
//       2: { used: 0 },
//       3: { used: 0 },
//       4: { used: 0 },
//       5: { used: 0 },
//       6: { used: 0 },
//       7: { used: 0 },
//       8: { used: 0 },
//       9: { used: 0 },
//     },
//   },
// };

export const randomize = () => {
  const id = generateID();
  const race = _.sample(PLAYABLE_RACES) as Race;
  const classElement = _.sample(PLAYABLE_CLASSES) as ClassElement;
  const background = _.sample(BACKGROUNDS) as BackgroundElement;
  const name = generate_name('base');
  const abilityScores = diceRoller
    .roll('{4d6kh3...6}')
    .renderedExpression.split('}')
    .filter(e => e)[0]
    .replace(/[{}]/g, '')
    .split(';')
    .map(roll => roll.split('=')[1].trim());
  const randomCharacter: CharacterBase = {
    id,
    raceData: {
      race: race.name,
      chosenRaceAbilities: race.ability
        ? _.sampleSize(
            race.ability[0].choose?.from,
            race.ability[0].choose?.count,
          ).reduce((acc: any, curr: string) => ({ ...acc, [curr]: 1 }), {})
        : [],
      standardRaceAbilities: [],
      chosenRaceSkillProficiencies: race.skillProficiencies
        ? _.sampleSize(
            race.skillProficiencies[0].choose?.from.filter(
              entry => typeof entry === 'string',
            ) as SkillTypes[],
            race.skillProficiencies[0].choose?.count,
          )
        : [],
      standardRaceSkillProficiencies: [],
      chosenRaceLanguages: race.languageProficiencies
        ? _.sampleSize(
            Parser.LANGUAGES_STANDARD.concat(Parser.LANGUAGES_EXOTIC),
            race.languageProficiencies[0].anyStandard || 0,
          )
        : [],
      standardRaceLanguages: [],
    },
    classData: {
      classElement: classElement.name,
      subClass: _.sample(
        classElement.subclasses.filter(subclass => filterSources(subclass)),
      )?.name!,
      chosenClassSkillProficiencies: classElement.startingProficiencies.skills
        ? (_.sampleSize(
            classElement.startingProficiencies.skills[0].choose?.from,
            classElement.startingProficiencies.skills[0].choose?.count,
          ) as SkillTypes[])
        : [],
      standardClassArmorProficiencies: [],
      standardClassWeaponProficiencies: [],
      standardClassToolProficiencies: [],
      abilityScores: {
        str: Number(abilityScores[0]),
        dex: Number(abilityScores[1]),
        con: Number(abilityScores[2]),
        int: Number(abilityScores[3]),
        wis: Number(abilityScores[4]),
        cha: Number(abilityScores[5]),
        rollMethod: 'rolled',
      },
    },
    descriptionData: {
      name: name,
      background: background.name,
      alignment: _.sample(Object.keys(Parser.ALIGNMENTS))!,
      characteristicsSource: background.name,
      imageUrl: `${
        process.env.PUBLIC_URL
      }/img/races/${race.name.toLowerCase()}.png`,
      hair: _.sample([
        'Brown',
        'Blonde',
        'Dark',
        'Grey',
        'Green',
        'Red',
        'Blue',
        'Auburn',
        'Purple',
      ])!,
      skin: _.sample([
        'Pale',
        'Fair',
        'Light',
        'Light Tan',
        'Tan',
        'Dark Tan',
        'Brown',
        'Dark Brown',
        'Bronze',
        'Orange',
        'Red',
        'Aqua',
        'Green',
      ])!,
      eyes: _.sample([
        'Amber',
        'Blue',
        'Brown',
        'Gray',
        'Green',
        'Hazel',
        'Red and violet',
      ])!,
      height: `${_.random(110, 210)} cm`,
      weight: `${_.random(30, 130)} kg`,
      age: `${_.random(12, 120)} years`,
      backstory: 'I just sprung in to existence, out of thin air!',
      chosenBackgroundSkillProficiencies: background.skillProficiencies
        ? _.sampleSize(
            background.skillProficiencies[0].choose?.from.filter(
              entry => typeof entry === 'string',
            ) as SkillTypes[],
            background.skillProficiencies[0].choose?.count,
          )
        : [],
      standardBackgroundSkillProficiencies: [],
      chosenBackgroundToolProficiencies: background.toolProficiencies
        ? _.sampleSize(
            background.toolProficiencies[0].choose?.from.filter(
              entry => typeof entry === 'string',
            ) as string[],
            background.toolProficiencies[0].choose?.count,
          )
        : [],
      standardBackgroundToolProficiencies: [],
      chosenBackgroundLanguages: background.languageProficiencies
        ? _.sampleSize(
            Parser.LANGUAGES_STANDARD.concat(Parser.LANGUAGES_EXOTIC),
            background.languageProficiencies[0].anyStandard || 0,
          )
        : [],
      standardBackgroundLanguages: [],
      characteristicsPersonalityTrait: '',
      characteristicsIdeal: '',
      characteristicsBond: '',
      characteristicsFlaw: '',
    },
    equipmentData: {
      items: _.sampleSize(WEAPONS as any, 2)
        .map(item => item.name)
        .concat(_.sampleSize(ALL_OTHER_ITEMS as any, 2).map(item => item.name))
        .concat(_.sampleSize(ARMOR, 1).map(item => item.name)),
    },
  };
  return randomCharacter;
};

export const generateID = () =>
  `${Math.random()
    .toString(16)
    .slice(2)}`;

const initialState: CharacterList = {
  id: 'NOT_SAVED_YET',
  loading: 'idle',
  list: [],
};

// Async Thunks
export const CHARACTERLIST_SLICE = 'characterList';
export const BACKGROUND_SAVE_ACTION = `${CHARACTERLIST_SLICE}/backgroundSave`;
export const BACKGROUND_CREATE_ACTION = `${CHARACTERLIST_SLICE}/backgroundCreate`;
export const GET_LIST_ACTION = `${CHARACTERLIST_SLICE}/getList`;

export const backgroundCreate: any = createAsyncThunk<
  any,
  undefined,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>(BACKGROUND_CREATE_ACTION, async (_, thunkAPI) => {
  const response = await DnDAboveAPI.create(thunkAPI.getState().characterList);
  if (response.status >= 400) {
    return thunkAPI.rejectWithValue(await response.json());
  }
  return await response.json();
});

export const backgroundSave: any = createAsyncThunk<
  any,
  undefined,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>(
  BACKGROUND_SAVE_ACTION,
  async (_, thunkAPI) => {
    const response = await DnDAboveAPI.update(
      thunkAPI.getState().characterList,
    );
    if (response.status >= 400) {
      return thunkAPI.rejectWithValue(await response.json());
    }
    return await response.json();
  },
  {
    condition: (_, { getState }) => {
      const { characterList } = getState();
      const fetchStatus = characterList.loading;
      if (fetchStatus === 'pending') {
        // Already fetching, don't need to re-fetch
        return false;
      }
    },
  },
);

export const getCharacterList = createAsyncThunk<
  any,
  undefined,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>(
  GET_LIST_ACTION,
  async (_, thunkAPI) => {
    const response = await DnDAboveAPI.readAll();
    console.log(response);

    if (response.status === 404) {
      thunkAPI.dispatch(backgroundCreate());
      return thunkAPI.rejectWithValue(await response.json());
    }
    if (response.status >= 400) {
      return thunkAPI.rejectWithValue(await response.json());
    }
    return await response.json();
  },
  {
    condition: (_, { getState }) => {
      const { characterList } = getState();
      const fetchStatus = characterList.loading;
      if (fetchStatus === 'pending') {
        // Already fetching, don't need to re-fetch
        return false;
      }
    },
  },
);

const characterListSlice = createSlice({
  name: CHARACTERLIST_SLICE,
  initialState,
  reducers: {
    addCharacter(state, action: PayloadAction<CreateCharacterFormState>) {
      const { id, ...character } = action.payload.data;
      const raceElement = getRace(character.raceData.race);
      const classElement = getClass(character.classData.classElement);
      const backgroundElement = getBackground(
        character.descriptionData.background,
      );
      const allSources = getCookie('allSources') === 'true';
      const newCharacter: CharacterListItem = {
        id,
        allSources,
        raceData: {
          ...character.raceData,
          standardRaceAbilities: raceElement?.ability
            ? [_.omit(raceElement?.ability[0], 'choose')]
            : [],
          standardRaceSkillProficiencies: getIncludedProficiencies(
            raceElement?.skillProficiencies!,
          ) as SkillTypes[],
          standardRaceLanguages: getIncludedProficiencies(
            raceElement?.languageProficiencies!,
          ),
        },
        classData: {
          ...character.classData,
          standardClassArmorProficiencies: classElement?.startingProficiencies
            .armor
            ? mapArmorProficiencies(classElement?.startingProficiencies.armor)
            : [],
          standardClassWeaponProficiencies:
            classElement?.startingProficiencies.weapons! || [],
          standardClassToolProficiencies: getIncludedProficiencies(
            classElement?.startingProficiencies?.tools!,
          ),
        },
        descriptionData: {
          ...character.descriptionData,
          standardBackgroundSkillProficiencies: getIncludedProficiencies(
            backgroundElement?.skillProficiencies!,
          ) as SkillTypes[],
          standardBackgroundToolProficiencies: getIncludedProficiencies(
            backgroundElement?.toolProficiencies!,
          ),
          standardBackgroundLanguages: getIncludedProficiencies(
            backgroundElement?.languageProficiencies!,
          ),
        },
        equipmentData: {
          items: character.equipmentData.items,
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
          spells: [],
          conditions: [],
          defenses: [],
          attunements: [],
          actions: [],
          extras: [],
          ac: 0,
          currentHp:
            10 +
            getAbilityMod(calculateStats(character as CharacterListItem).dex),
          currentHd: 1,
          spellSlots: isSpellCaster(character as CharacterListItem)
            ? {
                1: { used: 0 },
                2: { used: 0 },
                3: { used: 0 },
                4: { used: 0 },
                5: { used: 0 },
                6: { used: 0 },
                7: { used: 0 },
                8: { used: 0 },
                9: { used: 0 },
              }
            : undefined,
        },
      };
      state.list.push({ ...newCharacter });
    },
    updateCharacter(state, action: PayloadAction<CreateCharacterFormState>) {
      const character = state.list.find(
        char => char.id === action.payload.data.id,
      );
      if (character) {
        character.raceData = {
          ...character.raceData,
          ...action.payload.data.raceData,
        };
        character.classData = {
          ...character.classData,
          ...action.payload.data.classData,
        };
        character.descriptionData = {
          ...character.descriptionData,
          ...action.payload.data.descriptionData,
        };
        character.equipmentData = {
          ...character.equipmentData,
          ...action.payload.data.equipmentData,
        };
      }
    },
    removeCharacter(state, action: PayloadAction<string>) {
      state.list = state.list.filter(item => item.id !== action.payload);
    },
    setAc(state, action: PayloadAction<{ id: string; ac: number }>) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.ac = Number(action.payload.ac);
      }
    },
    setHp(
      state,
      action: PayloadAction<{ id: string; hp: number; type: string }>,
    ) {
      const { id, hp, type } = action.payload;
      const character = state.list.find(chara => chara.id === id);
      if (character) {
        character.gameData.currentHp =
          type === 'heal'
            ? character.gameData.currentHp + Number(hp)
            : character.gameData.currentHp - Number(hp);
      }
    },
    setCurrentHd(
      state,
      action: PayloadAction<{ id: string; currentHd: number }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.currentHd = Number(action.payload.currentHd);
      }
    },
    longRest(state, action: PayloadAction<{ id: string }>) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        const gainedHDs =
          character.gameData.currentHd +
            Math.ceil(Number(character.gameData.currentHd) / 2) || 1;
        character.gameData.currentHd = Math.min(
          gainedHDs,
          character.gameData.level,
        );
        character.gameData.currentHp = getMaxHP(character);
        const spellSlots = character.gameData.spellSlots;
        character.gameData.spellSlots = spellSlots
          ? Object.keys(spellSlots).reduce((acc: any, key) => {
              acc[key] = { ...(spellSlots as any)[key], used: 0 };
              return acc;
            }, {})
          : undefined;
      }
    },
    expendHitDie(state, action: PayloadAction<{ id: string }>) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.currentHd = character.gameData.currentHd - 1;
        const mod = getAbilityMod(calculateStats(character)['con']);
        const rolledHp = diceRoller.roll(`1${getHitDice(character)}`).total;
        const fullHp = getMaxHP(character);
        const newHp = character.gameData.currentHp + rolledHp + mod;
        character.gameData.currentHp = newHp < fullHp ? newHp : fullHp;
      }
    },
    addDefense(
      state,
      action: PayloadAction<{
        id: string;
        data: { type: DefenseType; name: string };
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.defenses.push(action.payload.data);
      }
    },
    removeDefense(
      state,
      action: PayloadAction<{
        id: string;
        data: { type: DefenseType; name: string };
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.defenses = character.gameData.defenses.filter(
          item =>
            !(
              action.payload.data.name === item.name &&
              action.payload.data.type === item.type
            ),
        );
      }
    },
    addCondition(
      state,
      action: PayloadAction<{
        id: string;
        data: string;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.conditions.push(action.payload.data);
      }
    },
    removeCondition(
      state,
      action: PayloadAction<{
        id: string;
        data: string;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.conditions = character.gameData.conditions.filter(
          item => item !== action.payload.data,
        );
      }
    },
    addFeat(
      state,
      action: PayloadAction<{
        id: string;
        data: string;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.feats.push(action.payload.data);
      }
    },
    removeFeat(
      state,
      action: PayloadAction<{
        id: string;
        data: string;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.feats = character.gameData.feats.filter(
          item => item !== action.payload.data,
        );
      }
    },
    expendSpellSlot(
      state,
      action: PayloadAction<{
        id: string;
        data: number;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.spellSlots![action.payload.data].used =
          character.gameData.spellSlots![action.payload.data].used + 1;
      }
    },
    addSpellSlot(
      state,
      action: PayloadAction<{
        id: string;
        data: number;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.spellSlots![action.payload.data].used =
          character.gameData.spellSlots![action.payload.data].used - 1;
      }
    },
    updateASI(
      state,
      action: PayloadAction<{
        id: string;
        data: AbilityBase;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.customData.customAbilities = [
          {
            ...character.customData.customAbilities[0],
            ...action.payload.data,
          },
        ];
      }
    },
    addCustomProficiency(
      state,
      action: PayloadAction<{
        id: string;
        data: SkillTypes;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.customData.customSkillProficiencies.push(action.payload.data);
      }
    },
    removeCustomProficiency(
      state,
      action: PayloadAction<{
        id: string;
        data: SkillTypes;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.customData.customSkillProficiencies = character.customData.customSkillProficiencies.filter(
          item => item !== action.payload.data,
        );
      }
    },
    updateSpells(
      state,
      action: PayloadAction<{
        id: string;
        data: { row: number; name: string }[];
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.spells = action.payload.data;
      }
    },
    levelUp(state, action: PayloadAction<{ id: string }>) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.level = character.gameData.level + 1;
      }
    },
  },
  extraReducers: builder => {
    // Reducers for additional action types here, and handle loading state as needed
    // backgroundCreate
    builder.addCase(backgroundCreate.pending, (state, { payload }) => {
      if (state.loading === 'idle') {
        state.loading = 'pending';
      }
    });
    builder.addCase(backgroundCreate.fulfilled, (state, { payload }) => {
      const { ref } = payload;
      if (state.loading === 'pending' || state.loading === 'error') {
        state.loading = 'idle';
        state.id = ref['@ref'].id;
      }
    });
    builder.addCase(backgroundCreate.rejected, (state, { payload }) => {
      if (state.loading === 'pending' || state.loading === 'error') {
        state.loading = 'error';
        state.error = (payload as any).message;
      }
    });
    // backgroundSave
    builder.addCase(backgroundSave.pending, (state, { payload }) => {
      if (state.loading === 'idle') {
        state.loading = 'pending';
      }
    });
    builder.addCase(backgroundSave.fulfilled, (state, { payload }) => {
      if (state.loading === 'pending' || state.loading === 'error') {
        state.loading = 'idle';
      }
    });
    builder.addCase(backgroundSave.rejected, (state, { payload }) => {
      if (state.loading === 'pending' || state.loading === 'error') {
        state.loading = 'error';
        state.error = (payload as any).message;
      }
    });
    // getCharacterList
    builder.addCase(getCharacterList.pending, (state, { payload }) => {
      if (state.loading === 'idle') {
        state.loading = 'pending';
      }
    });
    builder.addCase(getCharacterList.fulfilled, (state, { payload }) => {
      if (state.loading === 'pending' || state.loading === 'error') {
        state.loading = 'idle';
      }
      const { ref, data } = payload;
      state.id = ref['@ref'].id;
      state.list = data.list;
    });
    builder.addCase(getCharacterList.rejected, (state, { payload }) => {
      if (state.loading === 'pending' || state.loading === 'error') {
        state.loading = 'error';
        state.error = (payload as any).message;
      }
    });
  },
});

export const {
  addCharacter,
  updateCharacter,
  removeCharacter,
  setAc,
  setHp,
  setCurrentHd,
  longRest,
  expendHitDie,
  addDefense,
  removeDefense,
  addCondition,
  removeCondition,
  expendSpellSlot,
  addSpellSlot,
  updateASI,
  addCustomProficiency,
  removeCustomProficiency,
  updateSpells,
  levelUp,
  addFeat,
  removeFeat,
} = characterListSlice.actions;

export default characterListSlice.reducer;
