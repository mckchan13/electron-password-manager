// Child process
import { MessagePortMain } from "electron";
import { SqlDatabase, SqlDatabaseConfig } from "../db";
import { SavePasswordPayload } from "../../renderer/hooks";
import { Valence } from "../../lib/Valence";
import { requestValidator } from "../../lib/Valence/middleware";
import { ValenceContext } from "../../lib/Valence/types";

process.on("uncaughtException", (err, origin) => {
  console.error(err);
  console.error(origin);
});

process.on("unhandledRejection", (err, origin) => {
  console.error(err);
  console.error(origin);
});

process.on("loaded", async () => {
  await main();
});

async function main(): Promise<void> {
  const userInfo = {
    writablePath: undefined,
    pathLocationName: undefined,
  };

  const processUtilties: {
    port: MessagePortMain | undefined;
    db: SqlDatabase | undefined;
  } = {
    port: undefined,
    db: undefined,
  };

  const userPathSet = await new Promise<boolean>((resolve) => {
    process.parentPort.prependOnceListener("message", (event) => {
      const { message, body } = event.data;
      userInfo.pathLocationName = message;
      userInfo.writablePath = body;
      process.parentPort.postMessage("userPathSet");
      resolve(true);
    });
  });

  if (!userPathSet) {
    console.error("The process was unable to set the user path.");
  }

  const config: SqlDatabaseConfig = {
    writablePath: userInfo.writablePath,
    writablePathLocationName: userInfo.pathLocationName,
  };

  processUtilties.db = new SqlDatabase(config);

  const db = processUtilties.db;
  await db.initDb({ loadDummyData: true });

  const valence = new Valence({ datasources: { sql: db } });

  valence.usePreHook(requestValidator());

  valence.use("getAllPasswords", async (ctx: ValenceContext): Promise<void> => {
    const ds = ctx.datasources as { sql: SqlDatabase };
    const passwords = await ds.sql.getAllPasswords();
    console.log(passwords);
    ctx.response.send(passwords);
  });

  valence.use("savePassword", async (ctx: ValenceContext): Promise<void> => {
    const {
      request: { payload },
    } = ctx;
    const {
      username: name,
      password,
      secretKey: secret,
    } = payload as SavePasswordPayload;
    const descriptor = "";
    const ds = ctx.datasources as { sql: SqlDatabase };
    await ds.sql.savePassword(name, password, descriptor, secret);
    ctx.response.send("Successfully saved");
  });

  valence.listen(() => {
    console.log("Listening on parent port... ");
  });
}
