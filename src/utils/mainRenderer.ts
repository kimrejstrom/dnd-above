const Renderer = (window as any).Renderer;
export const mainRenderer = new Renderer();
export const SourceUtil = (window as any).SourceUtil;
export const Parser = (window as any).Parser;

export function search(array: any[], keywords: string[], not?: string) {
  const check = (obj: any): boolean => {
    if (obj.source && obj.source.includes('UA')) {
      return false;
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.values(obj).some(check);
    }
    if (Array.isArray(obj)) {
      return obj.some(check);
    }
    return (
      typeof obj === 'string' &&
      keywords.some(word => {
        const regExp = new RegExp(word, 'gi');
        return not
          ? (regExp.test(obj as any) || obj.includes(word)) &&
              !obj.includes(not)
          : regExp.test(obj as any) || obj.includes(word);
      })
    );
  };
  return array.filter(check);
}
