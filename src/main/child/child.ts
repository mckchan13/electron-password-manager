// Child process
import { MessagePortMain } from "electron";
import { SqlDatabase, SqlDatabaseConfig } from "../db";
import { RequestObject, ResponseObject } from "../../renderer/hooks";

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
      // message arg from postMessage becomes event.data on the listener
      const { message, body } = event.data;
      userInfo.pathLocationName = message;
      userInfo.writablePath = body;
      process.parentPort.postMessage("userPathSet");
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
    if (event.ports.length === 0) {
      throw new Error("No ports included with request");
    }
    console.log("Forwarding request to router");
    await router(event, event.ports, db);
  });
}

async function router(
  event: Electron.MessageEvent,
  ports: MessagePortMain[],
  db: SqlDatabase
): Promise<void> {
  const request: RequestObject = event.data;

  let response: ResponseObject;
  let payload: unknown;

  switch (request.context) {
    case "getAllPasswords": {
      console.log("getAllPasswords firing")
      payload = await db.getAllPasswords();
      response = {
        status: "success",
        context: "getAllPasswords",
        payload,
      };
      break;
    }
    case "savePassword": {
      const { username, password, secret } = request.payload as {
        username: string;
        password: string;
        secret: string;
      };
      await db.savePassword(username, password, "", secret);
      response = {
        status: "success",
        context: "savePassword",
        payload: null,
      };
      break;
    }
    default:
      response = {
        status: "failure",
        context: request.context,
        payload: null,
      };
  }

  const responsePort = ports[0];

  console.log("child is about to respond");
  responsePort.postMessage(response);
  responsePort.start();
}
