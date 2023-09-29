import { RequestObject, ValenceMethods } from "../..";
import { Deferred } from "../../../DeferredPromise";

export type ValenceRequestResult<T = unknown> = {
  status: "loading" | "success" | "failure" | string;
  result: Promise<T>;
  setStatus: (newStatus: string) => void;
};

function useValenceRequest(requestObject: RequestObject): ValenceRequestResult;
function useValenceRequest(
  method: ValenceMethods,
  channel: string,
  route: string,
  payload?: unknown
): ValenceRequestResult;
function useValenceRequest<T = unknown>(
  methodOrRequestObject: ValenceMethods | RequestObject,
  channel?: string,
  route?: string,
  payload?: T
): ValenceRequestResult {
  let request: RequestObject;

  assertValueIsNonNullish(
    methodOrRequestObject,
    "Null or undefined cannot be passed as the first argument."
  );

  if (typeof methodOrRequestObject === "object") {
    const { method, route, channel } = methodOrRequestObject;

    const assertionCases = [
      { value: method, message: "Request method is not defined" },
      { value: route, message: "Request route is not defined" },
      { value: channel, message: "Request channel is not defined" },
    ];

    for (const { value, message } of assertionCases) {
      assertValueIsNonNullish(value, message);
    }

    request = methodOrRequestObject;
  } else {
    assertValueIsNonNullish(
      methodOrRequestObject as ValenceMethods,
      "Request method is not defined."
    );
    assertValueIsNonNullish(channel, "Request channel is not defined.");
    assertValueIsNonNullish(route, "Request route is not defined.");
    request = {
      method: methodOrRequestObject,
      route,
      payload,
      channel,
    };
  }

  const deferred = new Deferred();

  const requestResult: ValenceRequestResult = {
    status: "loading",
    result: deferred.promise,
    setStatus: function (newStatus: string) {
      this.status = newStatus;
    },
  };

  requestResult.setStatus.bind(requestResult);

  window.valenceAPI
    .fetch(request)
    .then((data) => {
      requestResult.setStatus("success");
      deferred.resolve(data);
    })
    .catch((reason) => {
      requestResult.setStatus("failed");
      deferred.reject(reason);
    });

  return requestResult;
}

export default useValenceRequest;

function assertValueIsNonNullish<T = unknown>(
  value: T,
  message: string
): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(message);
  }
}
