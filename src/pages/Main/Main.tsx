import React from 'react';
import { useSelector } from 'react-redux';
import { getSelectedCharacter } from 'app/selectors';
import CharacterListing from 'pages/Create/CharacterListing';
import { CharacterSheet } from 'pages/Main/CharacterSheet';

interface Props {}

export const Main: React.FC<Props> = () => {
  const character = useSelector(getSelectedCharacter);

  return character && character.id ? (
    <CharacterSheet character={character} />
  ) : (
    <CharacterListing />
  );
};
