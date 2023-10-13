import { EffectCallback, useEffect } from "react";

function useCancellableEffect<T = unknown>(
  effectCallbackWithController: (abortController: AbortController) => void,
  deps?: T[]
) {
  const effectCallback: EffectCallback = () => {
    const abortController = new AbortController();
    return effectCallbackWithController(abortController);
  };

  useEffect(effectCallback, deps);
}

export default useCancellableEffect;
