import Cryptr from 'cryptr';

export async function handleEncryptPassword(
  _: Electron.IpcMainInvokeEvent,
  data: string[]
) {

  const [__, password, secretKey] = data

  const cryptr = new Cryptr(secretKey);
  const encryptedString = cryptr.encrypt(password);
  const decryptedString = cryptr.decrypt(encryptedString);
  console.log(decryptedString);

  return encryptedString;
}
