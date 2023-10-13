import { useState, MouseEventHandler, MouseEvent } from "react";
import { RequestObject } from ".";
import { PasswordEntry } from "../../main/db";
import useCancellableEffect from "./useCancellableEffect";

function useFetchPasswords() {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);

  const fetchPasswords = async (options?: { signal: AbortSignal }) => {
    const request = {
      method: "GET",
      route: "getAllPasswords",
      channel: "getAllPasswords",
      payload: undefined,
    } as const satisfies RequestObject;

    return window.electronAPI
      .fetch(request)
      .then((result) => {
        if (options?.signal.aborted) {
          const err = new Error("Previous request was aborted.");
          err.name = "AbortError";
          throw err;
        }
        console.log(result);
        console.log("setting passwords");
        setPasswords(result.payload);
      })
      .catch((error) => {
        console.log("caught in promise");
        console.error(error);
      });
  };

  const handleFetchPasswords: MouseEventHandler<HTMLButtonElement> = async (
    event: MouseEvent
  ) => {
    event.preventDefault();
    await fetchPasswords();
  };

  useCancellableEffect((abortController) => {
    const { signal } = abortController;

    fetchPasswords({ signal });

    return () => {
      abortController.abort();
    };
  }, []);

  return {
    passwords,
    handleFetchPasswords,
  };
}

export default useFetchPasswords;
