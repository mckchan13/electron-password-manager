import { useEffect, useState } from "react";

function useMainPort(): MessagePort | undefined {
  const [messagePort, setMessagePort] = useState<MessagePort>();

  useEffect(() => {
    console.log("useEffect firing");
    if (window.onmessage === null) {
      window.onmessage = (event) => {
        console.log("on message event was fired");
        // event.source === window means the message is coming from the preload
        // script, as opposed to from an <iframe> or other source.
        console.log(`[Main World][index.html]: on message event fired`);
        if (event.source === window && event.data === "main-world-port") {
          const [port] = event.ports;
          // Once we have the port, we can communicate directly with the main
          // process.

          port.onmessage = (event) => {
            console.log("[Main World][Renderer]:", event.data);
            port.postMessage("Hello from the main world!");
          };

          port.start();

          setMessagePort(port);
        }
      };
    }

    return () => {
      console.log("useEffect destructor firing");
      window.onmessage = null;
    };
  }, []);

  return messagePort;
}

export default useMainPort;
