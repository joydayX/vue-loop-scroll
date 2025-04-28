interface PromiseResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

function withResolvers<T>(): PromiseResolvers<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

// 直接执行 polyfill
if (!("withResolvers" in Promise)) {
  (Promise as any).withResolvers = withResolvers;
}
