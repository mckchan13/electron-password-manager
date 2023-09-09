import sqlite3, { RunResult } from "sqlite3";
import * as cryptr from "../lib/cryptr";

export type PasswordEntry = {
  id?: number;
  name: string;
  password: string;
  descriptor: string;
};

export class SqlDatabase {
  static #isInternalConstructing = false;

  static #instance: SqlDatabase;

  private db: sqlite3.Database;

  private constructor() {
    if (!SqlDatabase.#isInternalConstructing) {
      throw new TypeError(
        "Private SqlDatabase constructor is not constructable"
      );
    }

    SqlDatabase.#isInternalConstructing = false;

    console.log("SqlDatabase instance is constructing");

    if (process.env.NODE_ENV === "development") {
      console.log(
        `App started in dev mode, starting in-memory database in process ${process.pid}`
      );
      this.db = new sqlite3.Database(":memory:");
      return;
    }

    // For now always start db in memory for development
    this.db = new sqlite3.Database(":memory:");

    // try to load existing database file
    // TODO: find a way to get electron to write a new folder to either
    // "userData" or "appData" paths

    // const userDataPath = app.getPath("userData");
    // console.log(`Loading database file at ${userDataPath}/app.db`);
    // this.db = new sqlite3.Database(`${userDataPath}/app.db`);
    // return;
  }

  public static get instance(): SqlDatabase {
    // To prevent instantiation of separate database instances
    if (!this.#instance) {
      SqlDatabase.#isInternalConstructing = true;
      console.log(
        "No existing database instance, calling SqlDatabase constructor"
      );
      this.#instance = new SqlDatabase();
    }

    console.log("Getting #instance:", this.#instance);
    return this.#instance;
  }

  public async getAllPasswords(): Promise<PasswordEntry[]> {
    console.log(`executing SqlDatabase.getAllPasswords`)
    const db = this.db;
    const rows: PasswordEntry[] = [];
    db.each(
      "SELECT rowid AS id, descriptor, password FROM passwords",
      (err, row: PasswordEntry) => {
        if (err) {
          console.error("error", err);
        }
        console.log("here", row)
        rows.push(row);
      }
    );

    console.log(rows)

    return rows;
  }

  public async getPassword(id: number): Promise<PasswordEntry[]> {
    const rows: PasswordEntry[] = [];
    const db = this.db;
    db.get(
      `SELECT id, name, password, descriptor FROM passwords WHERE id = ?`,
      id,
      (error: Error, row: PasswordEntry) => {
        if (error) {
          console.error(error.message);
          return;
        }
        rows.push(row);
      }
    );
    return rows;
  }

  public addPassword(
    name: string,
    password: string,
    descriptor: string,
    secret: string
  ): void {
    const db = this.db;
    const stmt = db.prepare(
      `INSERT INTO passwords VALUES ($name, $pass, $desc);`,
      (_: sqlite3.Statement, error: Error) => {
        if (error) {
          console.error(error);
          return;
        }
      }
    );

    const encrypted = cryptr.encrypt(password, secret);

    stmt.run([name, encrypted, descriptor], (_: RunResult, error: Error) => {
      if (error) {
        console.error(error);
        return;
      }
    });
  }

  public addMultiplePasswords(passwords: PasswordEntry[]): void {
    // handle stuff
    console.log(passwords);
  }

  public deletePassword(id: number): void {
    // do stuff
    console.log(id);
  }

  public async initDb(): Promise<void> {
    console.log("Initalizing SQLite3 Database...");
    const db = this.db;

    /* Reminder: DO NOT PUT A COMMA ON LAST ROW FIELD 
    OTHERWISE IT IS A SYNTAX ERROR AND IT WILL
    CRASH THE DB AND THE CHILD PROCESS!!! */
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS passwords (
          name TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          descriptor TEXT
          );`
      );

      console.log("Table created, now preparing insert statement...");
      const stmt = db.prepare(
        `INSERT INTO passwords VALUES ($name, $pass, $desc);`
      );

      for (let i = 0; i < 10; i++) {
        stmt.run(String.fromCharCode("a".charCodeAt(0) + i), "password", "desc");
      }

      console.log("Finalizing statement...");
      stmt.finalize((error) => {
        if (error) {
          console.error(error);
        }
      });

      this.getAllPasswords()

      // db.each(
      //   "SELECT rowid AS id, name, descriptor, password FROM passwords",
      //   (err, row: PasswordEntry) => {
      //     if (err) {
      //       console.error(err);
      //     }
      //     console.log(row);
      //   }
      // );
    });
  }

  public closeDb(): void {
    console.log("Closing database... Goodbye.");
    this.db.close();
  }
}
