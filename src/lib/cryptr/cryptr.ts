import Cryptr from "cryptr";

export async function encrypt(password: string, secret: string): Promise<string> {
    const cryptr = new Cryptr(secret);
    const encryptedString = cryptr.encrypt(password);
    return encryptedString;
}

export async function decrypt(_: number, hashedPassword: string, secret: string): Promise<string> {
    const cryptr = new Cryptr(secret);
    const decryptedPassword = cryptr.decrypt(hashedPassword);
    return decryptedPassword;
}
