import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import Entry from 'components/Entry/Entry';
import { setDetailedEntry } from 'features/detailedEntry/detailedEntrySlice';
import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  findSearchResultSourceData,
  ResultType,
  SourceDataFuseItem,
} from 'utils/search';

interface Props {
  data?: any;
}

const DetailedEntry = ({ data }: Props) => {
  const dispatch = useDispatch();

  /** Tricky stuff here
   *  We parse the data-attributes from all 'link-entry' elements
   *  and add detailedEntryTrigger to them
   */
  const addDetailedEntryTriggerToElement = useCallback(
    (elem: Element) => {
      const name = elem.getAttribute('data-name');
      const type = elem.getAttribute('data-type');
      const mapTypeToEnum = (type: string) => {
        switch (type) {
          case 'races':
            return ResultType.Race;
          case 'spells':
            return ResultType.Spell;
          case 'items':
            return ResultType.Item;
          case 'classes':
            return ResultType.Class;
          case 'backgrounds':
            return ResultType.Background;
          case 'actions':
            return ResultType.Action;
          case 'languages':
            return ResultType.Language;
          case 'feats':
            return ResultType.Feat;
          case 'optionalfeatures':
            return ResultType.OptionalFeature;
          default:
            return ResultType.Unknown;
        }
      };

      // Map to searchable item
      const findableItem: SourceDataFuseItem = {
        name: name!,
        type: mapTypeToEnum(type!),
        src: '',
        page: 0,
      };

      const { data, renderer, jsx } = findSearchResultSourceData(findableItem);

      // Add the onClick listener to trigger setDetailedEntry
      elem.addEventListener('click', () =>
        dispatch(
          setDetailedEntry(
            jsx ? (
              jsx
            ) : renderer ? (
              <DangerousHtml extraClassName="tight" data={renderer} />
            ) : (
              <Entry entry={data} />
            ),
          ),
        ),
      );
    },
    [dispatch],
  );

  // Run once on first render for all link-entry elements present in the DOM
  useEffect(() => {
    Array.from(document.querySelectorAll('.link-entry')).forEach(elem => {
      addDetailedEntryTriggerToElement(elem);
    });
  }, [addDetailedEntryTriggerToElement]);

  // Run on each consecutive render ONLY for the items in the Detailed Entry panel
  useLayoutEffect(() => {
    Array.from(
      document.querySelectorAll('.detailed-entry .link-entry'),
    ).forEach(elem => {
      addDetailedEntryTriggerToElement(elem);
    });
  });

  return data ? (
    <div className="w-full dnd-body dark:prose-dark sm:prose-sm md:prose lg:prose-md sm:max-w-none md:max-w-none lg:max-w-none">
      {data}
    </div>
  ) : (
    <div className="opacity-50 p-4 h-full flex text-center justify-center items-center">
      <div>
        Select elements on the character sheet to display more information about
        them.
      </div>
    </div>
  );
};

export default DetailedEntry;
