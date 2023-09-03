import { useEffect } from "react";

function useMainPort() {
  useEffect(() => {
    if (window.onmessage === null) {
      window.onmessage = (event) => {
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
        }
      };
    }

    return () => {
      window.onmessage = null;
    };
  }, []);
}

export default useMainPort;
