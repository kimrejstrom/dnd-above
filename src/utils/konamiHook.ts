import { useState, useEffect, useCallback, useRef } from 'react';
import { setCookie } from 'utils/cookie';

export default function useKonamiCode() {
  // State for keeping track of konami state
  const [konamiCode, setIsKonami] = useState(false);

  const refIndex = useRef(0);

  const onKeyUpCallback = useCallback(e => {
    const codes = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];
    const onKeyUp = ({ key }: { key: any }) => {
      if (refIndex.current === codes.length - 1) {
        setIsKonami(true);
        setCookie('allSources', 'true');
        window.location.reload();
      }
      if (
        key != null &&
        codes[refIndex.current] != null &&
        key.toLowerCase() === codes[refIndex.current].toLowerCase()
      ) {
        refIndex.current++;
      } else {
        refIndex.current = 0;
        setIsKonami(false);
      }
    };
    onKeyUp(e);
  }, []);

  // Add event listeners
  useEffect(() => {
    window.addEventListener('keyup', onKeyUpCallback);
    return () => {
      window.removeEventListener('keyup', onKeyUpCallback);
    };
  }, [onKeyUpCallback]);

  return [konamiCode, setIsKonami];
}
