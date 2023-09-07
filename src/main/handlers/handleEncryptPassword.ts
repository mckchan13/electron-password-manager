import Cryptr from "cryptr";

export async function handleEncryptPassword(
  _: Electron.IpcMainInvokeEvent,
  data: string[],
) {
  const [, password, secretKey] = data;

  const encryptr = new Cryptr(secretKey);
  const encryptedString = encryptr.encrypt(password);
  console.log(`Encrypting from password => hash: ${password} => ${encryptedString}`);
  
  const decryptr = new Cryptr(secretKey)
  const decryptedString = decryptr.decrypt(encryptedString);
  console.log(`Decrypting from hash => password: ${encryptedString} => ${decryptedString}`);

  console.log(password === decryptedString)


  return encryptedString;
}
