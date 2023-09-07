// Child process
import { MessagePortMain } from "electron";
import { SqlDatabase } from "../db";

let port: MessagePortMain;

process.on("loaded", () => {
  SqlDatabase.instance.initDb();
});

process.parentPort.on("message", (event) => {
  const [portFromMainProcess] = event.ports;
  port = portFromMainProcess;
  process.parentPort.postMessage({
    message: "This message is intended for the parent",
  });

  port.on("message", (event) => {
    console.log(`Message received from main world: ${event.data}`);
    router(event);
  });

  port.postMessage({ message: "[From: Child Process] Port was received" });
  port.start();
});

process.on("exit", () => {
  SqlDatabase.instance.closeDb();
  console.log(`Child process ${process.pid} is exiting.`);
});

// encrypt and save

// decrypt and get

// auth

function router(event: Electron.MessageEvent) {
  switch (event.data) {
    case "addPassword":
      //do stuff
      break;
    case "deletePassword":
      // do stuff
      break;
    default:
    // do stuff
  }
}
