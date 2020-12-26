import React from 'react';
import { CharacterListItem } from 'features/character/characterListSlice';
import descriptionDark from 'images/description-dark.png';
import descriptionLight from 'images/description-light.png';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import Background from 'pages/Create/Background';
import PillFilter, { ContentBlock } from 'components/PillFilter/PillFilter';
import { Parser } from 'utils/mainRenderer';

interface Props {
  character: CharacterListItem;
}

const Description = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  return (
    <div>
      <div
        className="w-full my-2 relative bg-contain bg-center bg-no-repeat"
        style={{
          height: '5rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? descriptionLight : descriptionDark
          })`,
        }}
      ></div>
      <PillFilter pills={['background', 'characteristics', 'personality']}>
        <ContentBlock name="background">
          <Background background={character.descriptionData.background} />
        </ContentBlock>
        <ContentBlock name="characteristics">
          <ul className="mr-2 dnd-body">
            <li>
              <strong>Alignment: </strong>
              {(Parser.ALIGNMENTS as any)[character.descriptionData.alignment]}
            </li>
            <li>
              <strong>Age: </strong>
              {character.descriptionData.age}
            </li>
            <li>
              <strong>Hair: </strong>
              {character.descriptionData.hair}
            </li>
            <li>
              <strong>Skin: </strong>
              {character.descriptionData.skin}
            </li>
            <li>
              <strong>Eyes: </strong>
              {character.descriptionData.eyes}
            </li>
            <li>
              <strong>Height: </strong>
              {character.descriptionData.height}
            </li>
            <li>
              <strong>Weight: </strong>
              {character.descriptionData.weight}
            </li>
          </ul>
        </ContentBlock>
        <ContentBlock name="personality">
          <ul className="mr-2 dnd-body">
            <li>
              <strong>Trait: </strong>
              {character.descriptionData.characteristicsPersonalityTrait}
            </li>
            <li>
              <strong>Ideal: </strong>
              {character.descriptionData.characteristicsIdeal}
            </li>
            <li>
              <strong>Bond: </strong>
              {character.descriptionData.characteristicsBond}
            </li>
            <li>
              <strong>Flaw: </strong>
              {character.descriptionData.characteristicsFlaw}
            </li>
          </ul>
        </ContentBlock>
      </PillFilter>
    </div>
  );
};

export default Description;
