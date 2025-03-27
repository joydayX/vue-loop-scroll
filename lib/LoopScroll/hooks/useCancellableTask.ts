type AnyFunction = (...args: any[]) => Promise<any>;

class AsyncTaskCancelledError extends Error {
  readonly cancelled: boolean;

  constructor(message: string) {
    super(message);
    this.cancelled = true;
    Object.setPrototypeOf(this, AsyncTaskCancelledError.prototype);
  }
}

export const useCancellableTask = <T extends AnyFunction>(asyncTask: T) => {
  let cancelCounter = 0;
  let isExecuting = false;

  const cancel = () => {
    if (!isExecuting) return;
    cancelCounter++;
    isExecuting = false;
  };

  const isCancellable = () => isExecuting;

  const isCancelledError = (error: any) =>
    error instanceof AsyncTaskCancelledError;

  const execute = async function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ) {
    const currentCounter = cancelCounter;
    isExecuting = true;

    try {
      const result = await asyncTask.apply(this, args);

      if (currentCounter !== cancelCounter) {
        throw new AsyncTaskCancelledError("Async operation cancelled");
      }

      return result;
    } finally {
      isExecuting = false;
    }
  };

  return {
    execute,
    cancel,
    isCancellable,
    isCancelledError,
  };
};
