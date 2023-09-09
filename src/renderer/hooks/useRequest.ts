export type Requestor<M = unknown, R = unknown> = (message: M) => Promise<R>;

/**
 *
 * @returns Requestor
 */
function useRequest(): Requestor {
  return function request<M = unknown, R = unknown>(message: M): Promise<R> {
    const port1 = window.electronAPI.sendPortsToMain(
      "port-from-renderer",
      message
    );

    console.log(port1);

    return new Promise((resolve) => {
      port1.onmessage = (event) => {
        const response: R = event.data;
        console.log("port1 on message firing");
        resolve(response);
        port1.close();
      };
    });
  };
}

export default useRequest;
