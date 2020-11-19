import React, { useState } from 'react';
import TCE from 'data/book/book-tce.json';
import PHB from 'data/book/book-phb.json';
import XGE from 'data/book/book-xge.json';
import AI from 'data/book/book-ai.json';
import DMG from 'data/book/book-dmg.json';
import MM from 'data/book/book-mm.json';
import VGM from 'data/book/book-vgm.json';
import SCAG from 'data/book/book-scag.json';
import MTF from 'data/book/book-mtf.json';

import Entry from 'components/Entry/Entry';
import DetailedEntry from 'features/detailedEntry/DetailedEntry';
import { Parser } from 'utils/mainRenderer';
import StyledButton from 'components/StyledButton/StyledButton';

interface Props {}

const books = {
  PHB: PHB,
  DMG: DMG,
  MM: MM,
  XGE: XGE,
  TCE: TCE,
  VGM: VGM,
  SCAG: SCAG,
  MTF: MTF,
  AI: AI,
};

const Books = (props: Props) => {
  const [chosenBook, setChosenBook] = useState<any>();
  return (
    <div>
      {Object.entries(books).map(([name, data]) => {
        return (
          <StyledButton onClick={() => setChosenBook(data.data)}>
            {Parser.SOURCE_JSON_TO_FULL[name]}
          </StyledButton>
        );
      })}
      {chosenBook && (
        <div className="h-full my-2 custom-border custom-border-thin bg-yellow-100 dark:bg-tertiary-dark rounded-lg">
          <div className="h-full overflow-y-scroll px-2">
            <DetailedEntry data={<Entry entry={chosenBook} />} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
