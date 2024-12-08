import {useRef, useInsertionEffect, useCallback} from 'react';

// eslint-disable-next-line
export default function useStableCallback<T extends Function>(callback: T): T {
  const callbackRef = useRef(callback);
  useInsertionEffect(() => void (callbackRef.current = callback));
  // @ts-expect-error ignoring these types for now
  return useCallback<T>((...args) => callbackRef.current(...args), []) as unknown as T;
}
