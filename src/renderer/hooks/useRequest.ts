export type RequestHook<M = unknown, R = unknown> = (message: M) => Promise<R>;

export type RequestObject<T = unknown, K = unknown> = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  context: K;
  payload: T;
};

export type ResponseObject<T = unknown, K = unknown> = {
  status: "success" | "failure";
  context: K;
  payload: T;
};

function usePortRequest(
  requestFunc: () => unknown,
  resultsCb: (requestResult?: unknown) => void
): Promise<ResponseObject> {
  const requestResult = requestFunc();
  resultsCb(requestResult);

  return new Promise((resolve) => {
    // Need to trigger the main process to send a port via the mainWindow postMessage api
    // then listen for this port on the window
    window.onmessage = (event: MessageEvent) => {
      if (event.source === window && event.data === "main-world-port") {
        const [port] = event.ports;

        port.onmessage = (event: MessageEvent<ResponseObject>) => {
          console.log(event);
          const response: ResponseObject = event.data;

          queueMicrotask(() => {
            port.close();
            window.onmessage = null;
          });

          resolve(response);
        };
      }
    };
  });
}

export default usePortRequest;
