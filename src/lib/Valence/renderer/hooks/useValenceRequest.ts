import { RequestObject, ResponseObject, ValenceMethods } from "../..";
import { Deferred } from "../../../DeferredPromise";

export type ValenceRequestResult<T = unknown> = {
  status: "loading" | "success" | "failure" | string;
  result: Promise<T>;
  setStatus: (newStatus: string) => void;
};

function useValenceRequest(requestObject: RequestObject): ValenceRequestResult;
function useValenceRequest(
  channel: string,
  method: ValenceMethods,
  route: string,
  payload?: unknown
): ValenceRequestResult;
function useValenceRequest(
  channelOrRequestObject: string | RequestObject,
  method?: ValenceMethods,
  route?: string,
  payload?: unknown
): ValenceRequestResult {
  let request: RequestObject;

  if (typeof channelOrRequestObject === "object") {
    const { method, route } = channelOrRequestObject;
    assertValueIsNonNullish(method, "Request method is not defined.");
    assertValueIsNonNullish(route, "Request route is not defined.");
    request = channelOrRequestObject;
  } else {
    assertValueIsNonNullish(method, "Request method is not defined.");
    assertValueIsNonNullish(route, "Request route is not defined.");
    request = {
      method,
      route,
      payload,
      channel: channelOrRequestObject,
    };
  }

  const deferred = new Deferred<ResponseObject, Error>();

  const response: ValenceRequestResult = {
    status: "loading",
    result: deferred.promise,
    setStatus: function (newStatus: string) {
      this.status = newStatus;
    },
  };

  response.setStatus.bind(response);

  window.valenceAPI
    .fetch(request)
    .then((data) => {
      response.setStatus("success");
      deferred.resolve(data);
    })
    .catch((reason) => {
      response.setStatus("failed");
      deferred.reject(reason);
    });

  return response;
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
