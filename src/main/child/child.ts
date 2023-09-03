// Child process
import { MessagePortMain } from "electron";
import { SqlDatabase } from "../db";

let port: MessagePortMain;

process.on("loaded", () => {
  SqlDatabase.instance.initDb();
});

process.parentPort.once("message", (event) => {
  const [portFromMainProcess] = event.ports;
  port = portFromMainProcess;
  process.parentPort.postMessage({ message: "Port was received" });

  port.on("message", (event) => {
    console.log(`[Child Process][stdout]: Message received from main world: ${event.data}`);
  });

  port.postMessage({ message: "[Child Process] Port was received" });
  port.start();
});
