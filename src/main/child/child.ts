// Child process
import { MessagePortMain } from "electron";
import { PasswordEntry, SqlDatabase, SqlDatabaseConfig } from "../db";

const processUtilties: {
  port: MessagePortMain | undefined;
  db: SqlDatabase | undefined;
} = {
  port: undefined,
  db: undefined,
};

const userInfo = {
  writablePath: undefined,
  pathLocationName: undefined,
};

process.on("loaded", async () => {
  await main();
});

process.on("exit", () => {
  const db = processUtilties.db;
  if (db !== undefined) db.closeDb();
  console.log(`Child process ${process.pid} is exiting.`);
});

process.on("uncaughtException", (err, origin) => {
  console.error(err);
  console.error(origin);
});

process.on("unhandledRejection", (err, origin) => {
  console.error(err);
  console.error(origin);
});

async function main(): Promise<void> {
  const userPathSet = await new Promise<boolean>((resolve) => {
    process.parentPort.prependOnceListener("message", (event) => {
      const { message, body } = event.data;
      userInfo.pathLocationName = message;
      userInfo.writablePath = body;
      resolve(true);
    });
  });

  if (!userPathSet) {
    console.error("Something went wrong");
  }

  const config: SqlDatabaseConfig = {
    writablePath: userInfo.writablePath,
    writablePathLocationName: userInfo.pathLocationName,
  };

  processUtilties.db = new SqlDatabase(config);

  const db = processUtilties.db;
  await db.initDb({ loadDummyData: true });

  process.parentPort.on("message", async (event: Electron.MessageEvent) => {
    const response = await router(event, db);
    process.parentPort.postMessage(response);
  });
}

async function router(
  _event: Electron.MessageEvent,
  db: SqlDatabase
): Promise<PasswordEntry[]> {
  /**
   * event.data => message
   */
  const data = await db.getAllPasswords();
  console.log(`data returned from SqlDatabase:`, data);
  return data;
}

// port handlers
// function setupPortHandlers(): void {
//   const port = processUtilties.port;
//   if (port !== undefined) {
//     port.on("message", (event) => {
//       console.log(`Message received from main world: ${event}`);
//     });

//     port.postMessage({ message: "[From: Child Process] Port was received" });
//     port.start();
//   }
// }
