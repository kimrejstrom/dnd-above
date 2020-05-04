const Renderer = (window as any).Renderer;
export const mainRenderer = new Renderer();
export const SourceUtil = (window as any).SourceUtil;
export const Parser = (window as any).Parser;

export const getEntry = (
  entry: any,
  result: any[],
  keyToFind?: string,
  valueToFind?: string,
) => {
  if (Array.isArray(entry)) {
    entry.map(e => {
      getEntry(e, result, keyToFind, valueToFind);
    });
  } else if (typeof entry === 'object') {
    Object.entries(entry).map(([key, value]) => {
      if (key === keyToFind || value === valueToFind) {
        result.push(entry);
      } else {
        getEntry(value, result, keyToFind, valueToFind);
      }
    });
  } else if (typeof entry === 'string') {
    if (entry === keyToFind || entry === valueToFind) {
      result.push(entry);
    }
  }
  return result;
};
