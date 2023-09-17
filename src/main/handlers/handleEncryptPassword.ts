import Cryptr from "cryptr";

export async function handleEncryptPassword(_: Electron.IpcMainInvokeEvent, data: string[]) {
    try {
        const [, password, secretKey] = data;

        const encryptr = new Cryptr(secretKey);
        const encryptedString = encryptr.encrypt(password);
        console.log(`Encrypting from password => hash: ${password} => ${encryptedString}`);

        // Error is thrown if the wrong secret is used
        const decryptr = new Cryptr(secretKey);
        const decryptedString = decryptr.decrypt(encryptedString);
        console.log(`Decrypting from hash => password: ${encryptedString} => ${decryptedString}`);

        return encryptedString;
    } catch (err) {
        if (err instanceof Error) {
            console.error(err);
            return;
        }
        throw new Error(`Expected error to be thrown but got ${err} instead.`);
    }
}
