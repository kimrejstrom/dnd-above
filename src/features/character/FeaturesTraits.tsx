import React from 'react';
import { CharacterListItem } from 'features/character/characterListSlice';
import { getClass, getRace, getSubClass } from 'utils/sourceDataUtils';
import { ThemeMode } from 'features/theme/themeSlice';
import characterDark from 'images/character-dark.png';
import characterLight from 'images/character-light.png';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import PillFilter, { ContentBlock } from 'components/PillFilter/PillFilter';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import { mainRenderer } from 'utils/mainRenderer';
import { setDetailedEntry } from 'features/detailedEntry/detailedEntrySlice';
import {
  renderClassFeatures,
  renderSubClassFeatures,
  renderRaceTraits,
  renderFeats,
} from 'utils/render';

interface Props {
  character: CharacterListItem;
}

const FeaturesTraits = ({ character }: Props) => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const classElement = getClass(character.classData.classElement);
  const subClassElement = getSubClass(
    character.classData.classElement,
    character.classData.subClass,
  );
  const race = getRace(character.raceData.race);
  return (
    <div>
      <div
        className="w-full mt-2 relative bg-contain bg-center bg-no-repeat"
        style={{
          height: '5rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? characterLight : characterDark
          })`,
        }}
      ></div>
      <PillFilter pills={['class', 'race', 'feats']}>
        <ContentBlock name="class">
          <div className="text-lg">{classElement!.name} features</div>
          {renderClassFeatures(classElement!.name)}
          <div className="text-lg">{subClassElement!.name} features</div>
          {renderSubClassFeatures(classElement!.name, subClassElement!.name)}
        </ContentBlock>
        <ContentBlock name="race">
          <div
            className="text-lg cursor-pointer"
            onClick={() =>
              dispatch(
                setDetailedEntry(
                  <DangerousHtml
                    data={mainRenderer.race.getCompactRenderedString(race)}
                  />,
                ),
              )
            }
          >
            {race!.name} traits
          </div>
          {renderRaceTraits(race!)}
        </ContentBlock>
        <ContentBlock name="feats">
          {renderFeats(character.gameData.feats)}
        </ContentBlock>
      </PillFilter>
    </div>
  );
};

export default FeaturesTraits;
