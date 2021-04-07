import {  useRef, useEffect } from "react";

// helper hook to call a function regularly in time intervals 
export function usePoller(fn, delay, extraWatch) {
  const savedCallback = useRef();
  // Remember the latest fn.
  useEffect(() => {
    savedCallback.current = fn;
  }, [fn]);
  // Set up the interval.
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
  // run at start too
  useEffect(() => {
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[ extraWatch ]);
}