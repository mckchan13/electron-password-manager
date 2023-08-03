import * as fs from "fs/promises";
import * as path from "path";
import * as bcrypt from "bcrypt";

export async function handleEncryptPassword(
  _: Electron.IpcMainInvokeEvent,
  data: string[]
) {
  const [username, password] = data;

  const hash = await bcrypt.hash(password, 10);

  console.log("The encrypted hash", hash);
}
