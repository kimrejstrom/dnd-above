import React from 'react';
import { useSelector } from 'react-redux';
import { getSelectedCharacter } from 'app/selectors';
import CharacterList from 'pages/Main/CharacterList';
import { CharacterSheet } from 'pages/Main/CharacterSheet';
import { SourceDataFuseItem } from 'utils/search';

interface Props {
  searchIndex: Array<SourceDataFuseItem>;
}

export const Main: React.FC<Props> = ({ searchIndex }: Props) => {
  const character = useSelector(getSelectedCharacter);

  return character && character.id ? (
    <CharacterSheet
      character={character}
      readonly={false}
      searchIndex={searchIndex}
    />
  ) : (
    <CharacterList />
  );
};
