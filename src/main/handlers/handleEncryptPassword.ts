import Cryptr from 'cryptr';

export async function handleEncryptPassword(
  _: Electron.IpcMainInvokeEvent,
  data: string[]
) {

  const [username, password, encryptionKey] = data

  const cryptr = new Cryptr(encryptionKey);
  const encryptedString = cryptr.encrypt(password);
  const decryptedString = cryptr.decrypt(encryptedString);

  console.log("EncryptedString: ", encryptedString)
  console.log("DecryptedString: ", decryptedString)

}
