// Child process
import { MessagePortMain } from "electron";
import { SqlDatabase } from "../db";

let port: MessagePortMain;

process.parentPort.on("message", (event) => {
  // here the event.data will receive the value from "channel???"
  console.log(`Event received in child process: ${event.data}`)
  if (event.data.message === "port") {
    const [portFromMainProcess] = event.ports;
    port = portFromMainProcess;
    process.parentPort.postMessage({
      message: `Message from child process to parent. ${event.data.message} received.`,
    });
    setupPortHandlers();
  } else if (event.data.message === "port-from-renderer") {
    // const [portFromRenderer] = event.ports;
    console.log("here")
  }
});

process.on("loaded", () => {
  SqlDatabase.instance.initDb();
});

process.on("exit", () => {
  SqlDatabase.instance.closeDb();
  console.log(`Child process ${process.pid} is exiting.`);
});

// encrypt and save

// decrypt and get

// auth

function setupPortHandlers(): void {
  port.on("message", (event) => {
    console.log(`Message received from main world: ${event.data}`);
    router(event);
  });

  port.postMessage({ message: "[From: Child Process] Port was received" });
  port.start();
}

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
