const Renderer = (window as any).Renderer;
export const mainRenderer = new Renderer();
export const SourceUtil = (window as any).SourceUtil;
export const Parser = (window as any).Parser;

export function search(array: any[], keyword: string) {
  const regExp = new RegExp(keyword, 'gi');
  const check = (obj: any) => {
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
      (typeof obj === 'string' || typeof obj === 'number') &&
      regExp.test(obj as any)
    );
  };
  return array.filter(check);
}
