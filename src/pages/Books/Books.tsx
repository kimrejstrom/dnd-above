import React, { useEffect, useState } from 'react';
import Entry from 'components/Entry/Entry';
import DetailedEntry from 'features/detailedEntry/DetailedEntry';
import { Parser } from 'utils/mainRenderer';
import StyledButton from 'components/StyledButton/StyledButton';

interface Props {}

const Books = (props: Props) => {
  const [books, setBooks] = useState({});
  const [chosenBook, setChosenBook] = useState<any>();

  useEffect(() => {
    const loadBooks = async () => {
      const books = {
        PHB: (await import('data/book/book-phb.json')).default,
        TCE: (await import('data/book/book-tce.json')).default,
        DMG: (await import('data/book/book-dmg.json')).default,
        MM: (await import('data/book/book-mm.json')).default,
        XGE: (await import('data/book/book-xge.json')).default,
        VGM: (await import('data/book/book-vgm.json')).default,
        SCAG: (await import('data/book/book-scag.json')).default,
        MTF: (await import('data/book/book-mtf.json')).default,
      };
      setBooks(books);
    };
    loadBooks();
  }, []);
  return (
    <div className="w-full flex flex-col">
      <h1 className="text-center">Source Books</h1>
      <div className="flex justify-between">
        <StyledButton>A button</StyledButton>
        <StyledButton>A button</StyledButton>
        <StyledButton>A button</StyledButton>
        <StyledButton>A button</StyledButton>
        <StyledButton>A button</StyledButton>
      </div>

      <div className="my-3 w-full flex justify-evenly lg:justify-between flex-wrap">
        {Object.entries(books)
          .sort()
          .map(([name, data]) => {
            return (
              <div className="w-56 mb-3">
                <StyledButton
                  extraClassName="h-full"
                  onClick={() => setChosenBook((data as any).data)}
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
          <div className="w-full mb-4 h-screen">
            <div className="h-full my-2 custom-border custom-border-thin bg-light-200 dark:bg-dark-300 rounded-lg">
              <div className="h-full overflow-y-scroll px-2 overflow-x-hidden">
                <DetailedEntry data={<Entry entry={chosenBook} />} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;
