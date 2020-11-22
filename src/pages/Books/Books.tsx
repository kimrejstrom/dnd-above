import React, { useState } from 'react';
import TCE from 'data/book/book-tce.json';
import PHB from 'data/book/book-phb.json';
import XGE from 'data/book/book-xge.json';
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
};

const Books = (props: Props) => {
  const [chosenBook, setChosenBook] = useState<any>();
  return (
    <div className="w-full flex justify-center">
      <div className="w-full flex flex-col" style={{ maxWidth: '62rem' }}>
        <h1 className="text-center">Source Books</h1>
        <div className="w-full flex justify-evenly flex-wrap">
          {Object.entries(books)
            .sort()
            .map(([name, data]) => {
              return (
                <div className="w-56 mr-3 mb-3">
                  <StyledButton
                    extraClassName="h-full"
                    onClick={() => setChosenBook(data.data)}
                  >
                    <img
                      className="rounded w-full object-cover object-top"
                      onError={(ev: any) => {
                        ev.target.src = `${process.env.PUBLIC_URL}/img/books/default.jpeg`;
                      }}
                      src={`${process.env.PUBLIC_URL}/img/books/${name}.jpeg`}
                      alt="book cover"
                    />
                    <div className="mt-2 leading-none text-xl">
                      {Parser.SOURCE_JSON_TO_FULL[name]}
                    </div>
                  </StyledButton>
                </div>
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
      </div>
    </div>
  );
};

export default Books;
