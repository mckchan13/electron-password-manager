import path from "path";
import { utilityProcess, MessageChannelMain } from "electron";

// Main process
const handleForkUtilityProcess = (
  event: Electron.IpcMainInvokeEvent,
  data: string[]
) => {
  // take data received from ipcRenderer and pass on to
  // child process to encrypt passwords
  console.log("handleForkUtilityProcess is being invoked. Data: ", data);
  console.log(__dirname)
  const { port1 } = new MessageChannelMain();
  const [username, password] = data;
  const child = utilityProcess.fork(
    path.resolve(__dirname, "encryptPassword.js"),
    [username, password],
    { stdio: "pipe" }
  );
  child.postMessage({ data }, [port1]);
};

export default handleForkUtilityProcess;
