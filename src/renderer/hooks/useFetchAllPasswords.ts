import { useState, useEffect, MouseEventHandler, MouseEvent } from "react";
import { RequestObject } from ".";
import { PasswordEntry } from "../../main/db";

function useFetchPasswords() {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);

  const fetchPasswords = async (options?: { signal: AbortSignal }) => {
    const request = {
      method: "GET",
      route: "getAllPasswords",
      channel: "getAllPasswords",
      payload: undefined,
    } as const satisfies RequestObject;

    return window.electronAPI.fetch(request).then((result) => {
      if (options?.signal.aborted) {
        const err = new Error("Previous request was aborted.");
        err.name = "AbortError";
        throw err;
      }
      console.log(result);
      console.log("setting passwords");
      setPasswords(result.payload);
    });
  };

  const handleFetchPasswords: MouseEventHandler<HTMLButtonElement> = async (
    event: MouseEvent
  ) => {
    event.preventDefault();
    await fetchPasswords();
  };

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    try {
      fetchPasswords({ signal });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("outer try catch");
        console.error(error.message);
      }
    }

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
