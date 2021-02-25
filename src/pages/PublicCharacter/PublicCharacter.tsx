import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { CharacterSheet } from 'pages/Main/CharacterSheet';
import { getPublicById } from 'features/publicCharacter/publicCharacterSlice';
import { RootState } from 'app/rootReducer';
import { Loading } from 'components/Loading/Loading';
import { ThemeMode } from 'features/theme/themeSlice';
import beholderDark from 'images/beholder-dark.png';
import beholderLight from 'images/beholder-light.png';
import { getCookie, setCookie } from 'utils/cookie';
import { SourceDataFuseItem } from 'utils/search';
import { loadSourceData } from 'features/sourceData/sourceDataSlice';

interface Props {
  searchIndex: Array<SourceDataFuseItem>;
}

const PublicCharacter = ({ searchIndex }: Props) => {
  const dispatch = useDispatch();
  const { listId, characterId } = useParams<{
    listId?: string;
    characterId?: string;
  }>();

  const theme = useSelector((state: RootState) => state.theme);
  const { character, loading } = useSelector(
    (state: RootState) => state.publicCharacter,
  );
  const sourceData = useSelector((state: RootState) => state.sourceData);

  // Get public character
  useEffect(() => {
    if (!character && listId && characterId) {
      dispatch(getPublicById({ listId, characterId }));
    }
  }, [dispatch, listId, characterId, character]);

  // Check if allSources needed and refresh sourceData
  useEffect(() => {
    if (
      character &&
      character.allSources &&
      getCookie('allSources') !== 'true'
    ) {
      setCookie('allSources', 'true');
      dispatch(loadSourceData());
    }
  }, [dispatch, character]);

  // Check if we have everything needed to render
  const isCharacterReadyForRender =
    character?.id &&
    loading === 'idle' &&
    sourceData.loading === 'idle' &&
    ((character?.allSources && getCookie('allSources') === 'true') ||
      !character?.allSources);

  return isCharacterReadyForRender ? (
    <CharacterSheet
      character={character!}
      readonly={true}
      searchIndex={searchIndex}
    />
  ) : !character && (loading === 'error' || sourceData.loading === 'error') ? (
    <div className="mx-auto mt-8 pt-4 flex flex-col items-center justify-center">
      <div className="p-20 custom-border bg-light-300 dark:bg-dark-300 flex flex-col items-center justify-center">
        <img
          src={theme === ThemeMode.DARK ? beholderLight : beholderDark}
          className="h-40 w-40 px-2 py-2 shape-shadow"
          alt="logo"
        />
        <div className="text-center mb-4">
          <h1 className="leading-tight">D&amp;D Above</h1>
          <h3>Whoops! Something went wrong.</h3>
          <div
            className="my-3 p-2 border border-gray-300 dark:border-yellow-900 rounded-md w-full dark:text-yellow-100 dark:bg-yellow-800 bg-light-100 leading-none flex justify-center items-center"
            role="alert"
          >
            <span className="flex rounded-full text-yellow-100 bg-dark-100 px-2 py-1 text-xs font-bold mr-3">
              !
            </span>
            <div>Looks like the thing you were looking for doesn't exist.</div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default PublicCharacter;
