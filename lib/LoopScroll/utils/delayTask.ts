import { withResolvers } from ".";

type DelayResult = boolean;

export type DelayTaskPromise = Promise<DelayResult> & {
  isRunning: boolean;
};

const createDelay = (ms: number, callback?: () => void) => {
  const timeoutId = setTimeout(() => callback?.(), ms);
  return () => clearTimeout(timeoutId);
};

const cancelStore = new WeakMap<DelayTaskPromise, () => void>();

function createDelayTask(ms: number, callback?: () => void): DelayTaskPromise {
  let isRunning = true;
  const { resolve, promise } = withResolvers<DelayResult>();

  const done = () => {
    resolve(false);
    callback?.();
  };

  const stop = createDelay(ms, done);

  const delayTaskPromise = Object.defineProperty(promise, "isRunning", {
    get: () => isRunning,
  }) as DelayTaskPromise;

  cancelStore.set(delayTaskPromise, () => {
    if (isRunning) {
      isRunning = false;
      stop();
      resolve(true);
    }
  });

  promise.finally(() => {
    isRunning = false;
    cancelStore.delete(delayTaskPromise);
  });

  return delayTaskPromise;
}

function cancelDelayTask(promise: DelayTaskPromise) {
  cancelStore.get(promise)?.();
}

export { createDelayTask, cancelDelayTask };
