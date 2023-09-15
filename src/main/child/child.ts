// Child process
import { MessagePortMain } from "electron";
import { SqlDatabase, SqlDatabaseConfig } from "../db";
import { Photon } from "../lib/Photon";
import { SavePasswordPayload } from "../../renderer/hooks";

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

  const photon = new Photon({ datasources: { sql: db } });

  photon.use("getAllPasswords", async (ctx) => {
    const ds = ctx.datasources as { sql: SqlDatabase };
    const passwords = await ds.sql.getAllPasswords();
    ctx.response.send(passwords);
  });

  photon.use("savePassword", async (ctx) => {
    const {
      request: { payload },
    } = ctx;

    console.log(payload)

    const {
      username: name,
      password,
      secretKey: secret,
    } = payload as SavePasswordPayload;

    const descriptor = "";

    const ds = ctx.datasources as { sql: SqlDatabase };

    ds.sql.savePassword(name, password, descriptor, secret);
    
    ctx.response.send("Successfully saved")
  });

  photon.listen(() => {
    console.log("Listening on parent port... ");
  });
}
