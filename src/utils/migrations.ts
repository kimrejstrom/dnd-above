import { CharacterListItem } from 'features/character/characterListSlice';

// Migrate stored spells to V2
const migrateSpellsToV2 = (spells: any): string[] =>
  spells.map((sp: any) => (typeof sp === 'string' ? sp : sp.name));

// Migrations for character data
export const doMigrations = (characterList: CharacterListItem[]) => {
  const migratedList = characterList.map((character: CharacterListItem) => ({
    ...character,
    gameData: {
      ...character.gameData,
      spells: character.gameData.spells.length
        ? migrateSpellsToV2(character.gameData.spells)
        : [],
    },
  }));
  return migratedList;
};
