import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { SourceDataFuseItem } from 'utils/search';

export const useFuse = (list: SourceDataFuseItem[], options: any) => {
  // defining our query state in there directly
  const [query, updateQuery] = useState('');

  // NOTE: `limit` is actually a `fuse.search` option, but we merge all options for convenience
  const { limit, ...fuseOptions } = options;

  // let's memoize the fuse instance for performances
  const fuse = useMemo(() => new Fuse(list, fuseOptions), [list, fuseOptions]);

  // memoize results whenever the query or options change
  const hits = useMemo(() => fuse.search(query, { limit }), [
    fuse,
    limit,
    query,
  ]);

  // debounce updateQuery and rename it `setQuery` so it's transparent
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setQuery = useCallback(debounce(updateQuery, 300), []);

  // pass a handling helper to speed up implementation
  const onSearch = useCallback(e => setQuery(e.target.value.trim()), [
    setQuery,
  ]);

  // still returning `setQuery` for custom handler implementations
  return {
    hits,
    onSearch,
    query,
    setQuery,
  };
};
