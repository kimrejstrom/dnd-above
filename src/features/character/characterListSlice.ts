import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CreateCharacterFormState } from 'features/createCharacterForm/createCharacterFormSlice';
import { SkillTypes } from 'features/character/Skills';
import { ArmorEnum } from 'models/class';
import {
  getRace,
  getClass,
  getBackground,
  getIncludedProficiencies,
} from 'utils/character';
import _ from 'lodash';
import { AbilityBase } from 'models/race';
import { getCookie } from 'utils/cookie';

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
  id?: string;
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
    customAbilities: StatsTypes[];
    customSkillProficiencies: SkillTypes[];
    customArmorProficiencies: Array<ArmorEnum>;
    customWeaponProficiencies: string[];
    customToolProficiencies: string[];
    customLanguages: string[];
  };
}

export interface CharacterGameData {
  gameData: {
    level: number;
    feats: string[];
    spells: string[];
    attunements: string[];
    actions: any[];
    extras: any[];
  };
}

export type CharacterState = CharacterBase &
  CharacterCustom &
  CharacterGameData;
export interface CharacterListItem extends CharacterState {
  id: string;
}
export type CharacterList = Array<CharacterListItem>;
export const DEFAULT_ID = 'id-DEFAULT';
export const DEAFULT_CHARACTER: CharacterListItem = {
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
    spells: [],
    attunements: [],
    actions: [],
    extras: [],
  },
};

const MOE: CharacterListItem = {
  id: 'id-cb5de106a9e47',
  allSources: true,
  raceData: {
    race: 'Halfling (Ghostwise)',
    chosenRaceAbilities: [],
    standardRaceAbilities: [
      {
        dex: 2,
        wis: 1,
      },
    ],
    chosenRaceSkillProficiencies: [],
    standardRaceSkillProficiencies: [],
    chosenRaceLanguages: [],
    standardRaceLanguages: ['common', 'halfling'],
  },
  classData: {
    classElement: 'Druid',
    subClass: 'Circle of the Shepherd',
    chosenClassSkillProficiencies: ['insight', 'perception'],
    standardClassArmorProficiencies: ['light', 'medium', 'shields'],
    standardClassWeaponProficiencies: [
      'clubs',
      'daggers',
      'darts',
      'javelins',
      'maces',
      'quarterstaffs',
      'scimitars',
      'sickles',
      'slings',
      'spears',
    ],
    standardClassToolProficiencies: [],
    abilityScores: {
      rollMethod: 'roll',
      str: 9,
      dex: 15,
      con: 15,
      int: 10,
      wis: 17,
      cha: 9,
    },
  },
  descriptionData: {
    name: 'Moe Glee, The Minionmancer',
    background: 'Far Traveler',
    alignment: 'CG',
    characteristicsSource: 'Far Traveler',
    imageUrl: '/img/races/halfling (ghostwise).png',
    hair: 'Orange',
    skin: 'Greenish',
    eyes: 'Orange',
    height: '3ft',
    weight: '40',
    age: '19',
    backstory:
      'Born to a poor farmer family, Moe remembers very little about his parents. He still sees the flames that took them from him in his dreams, violently raging as they consume the last parts of his childhood home.\nMoe can’t remember how the fire started, but it haunts his dreams - night after night he is tormented by these visions. Again and again the flames erupt out of nowhere and each night he fails to escape them.\nShira, the fey spirit that watched over Moe and his tribe often walks the earth in the form of black panther. She managed to pull Moe from the flames on that fateful night, carrying the small boy to safety. She tried going back in for the others but was blocked by the flames.\nOrphaned, and with no-one of his kin left to care for him, Shira decided to bring the boy with her, deep into the forest where he would live with a new kind of tribe.\nFor fifteen years Moe lived together with the animals as a part of their herd. When Moe was seven Shira brought one of her old friends to the camp, a 250 year old tortle druid named Grok. Together Grok and Shira set out to teach Moe about the power of nature, the Great Balance and about the elements that guide it: the power of tooth and claw, of sun and moon and of fire and storm.\nWhen Moe turned 17, Shira came to Moe with a request. She had sensed a growing power, a darkness somewhere far away, disrupting the Great Balance. A force that seeks to hold sway over nature and life. She sent him on a mission to find out what this force is, and to try and restore the balance to their world.\nSo Moe set off towards the foreign lands of Asteria.',
    chosenBackgroundSkillProficiencies: [],
    standardBackgroundSkillProficiencies: ['insight', 'perception'],
    chosenBackgroundToolProficiencies: ['gaming set'],
    standardBackgroundToolProficiencies: [],
    chosenBackgroundLanguages: ['primordial'],
    standardBackgroundLanguages: [],
    characteristicsPersonalityTrait:
      "I have different assumptions from those around me concerning personal space, blithely invading others' space in innocence, or reacting to ignorant invasion of my own.",
    characteristicsIdeal:
      "Adventure. I'm far from home, and everything is strange and wonderful! (Chaotic)",
    characteristicsBond:
      'Though I had no choice, I lament having to leave my loved one(s) behind. I hope to see them again one day.',
    characteristicsFlaw:
      'I have a weakness for the new intoxicants and other pleasures of this land.',
  },
  equipmentData: {
    items: [
      'Quarterstaff',
      'Scimitar',
      'Leather Armor',
      'Shield',
      "Explorer's Pack",
      'Totem',
    ],
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
    level: 3,
    feats: [],
    spells: [
      'Guidance',
      'Produce Flame',
      'Shillelagh',
      'Entangle',
      'Goodberry',
      'Healing Word',
      'Thunderwave',
      'Barkskin',
      'Flaming Sphere',
      'Heat Metal',
      'Thorn Whip',
      'Shocking Grasp',
      'Vampiric Touch',
      'Counterspell',
    ],
    attunements: [],
    actions: [],
    extras: [],
  },
};

const initialState: CharacterList = [DEAFULT_CHARACTER, MOE];

const generateID = () =>
  `id-${Math.random()
    .toString(16)
    .slice(2)}`;

const characterListSlice = createSlice({
  name: 'characterList',
  initialState,
  reducers: {
    addCharacter: {
      reducer(
        state,
        action: PayloadAction<CreateCharacterFormState & { id: string }>,
      ) {
        const { id, ...character } = action.payload;
        const raceElement = getRace(character.data.raceData.race);
        const classElement = getClass(character.data.classData.classElement);
        const backgroundElement = getBackground(
          character.data.descriptionData.background,
        );
        const allSources = getCookie('allSources') === 'true';
        const newCharacter: CharacterListItem = {
          id,
          allSources,
          raceData: {
            ...character.data.raceData,
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
            ...character.data.classData,
            standardClassArmorProficiencies:
              classElement?.startingProficiencies.armor! || [],
            standardClassWeaponProficiencies:
              classElement?.startingProficiencies.weapons! || [],
            standardClassToolProficiencies: getIncludedProficiencies(
              classElement?.startingProficiencies?.tools!,
            ),
          },
          descriptionData: {
            ...character.data.descriptionData,
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
            items: character.data.equipmentData.items,
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
            attunements: [],
            actions: [],
            extras: [],
          },
        };
        state.push({ id, ...newCharacter });
      },
      prepare(payload: CreateCharacterFormState) {
        return { payload: { id: generateID(), ...payload } };
      },
    },
    updateCharacter(state, action: PayloadAction<CreateCharacterFormState>) {
      const character = state.find(char => char.id === action.payload.data.id);
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
      state.filter(item => item.id !== action.payload);
    },
  },
});

export const {
  addCharacter,
  updateCharacter,
  removeCharacter,
} = characterListSlice.actions;

export default characterListSlice.reducer;
