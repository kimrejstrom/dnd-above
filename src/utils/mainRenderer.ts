import { Renderer } from 'vendor/5e-tools/renderer';

const mainRenderer = new Renderer();

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
export default mainRenderer;
