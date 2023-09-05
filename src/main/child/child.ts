// Child process
import { MessagePortMain } from "electron";
import { SqlDatabase } from "../db";

let port: MessagePortMain;

process.on("loaded", () => {
  SqlDatabase.instance.initDb();
});

process.on("exit", () => {
  SqlDatabase.instance.closeDb();
  console.log(`Child process ${process.pid} is exiting.`);
});

process.parentPort.on("message", (event) => {
  const [portFromMainProcess] = event.ports;
  port = portFromMainProcess;
  process.parentPort.postMessage({
    message: "This message is intended for the parent",
  });

  port.on("message", (event) => {
    console.log(`Message received from main world: ${event.data}`);
  });

  port.postMessage({ message: "[From: Child Process] Port was received" });
  port.start();
});
