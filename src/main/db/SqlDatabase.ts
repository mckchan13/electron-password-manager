import sqlite3 from "sqlite3";
import * as cryptr from "../lib/cryptr";
import { PathLocationName } from "../index";

export type PasswordEntry = {
  id?: number;
  name: string;
  password: string;
  descriptor: string;
};

export type SqlDatabaseConfig = {
  writablePath: string | undefined;
  writablePathLocationName: PathLocationName | undefined;
};

export class SqlDatabase {
  db: sqlite3.Database;

  constructor(public readonly config: SqlDatabaseConfig) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `App started in dev mode, starting in-memory database in process ${process.pid}`
      );
      this.db = new sqlite3.Database(":memory:", (err) => {
        if (err instanceof Error) {
          return console.error(err.message);
        }
      });
      console.log("Connected to the in memory SQLite Database");
      return;
    }

    // For now always start db in memory for development
    this.db = new sqlite3.Database(":memory:", (err) => {
      if (err instanceof Error) {
        return console.error(err.message);
      }
    });
    console.log("Connected to the in memory SQLite Database");

    // try to load existing database file
    // TODO: find a way to get electron to write a new folder to either
    // "userData" or "appData" paths

    // const userDataPath = app.getPath("userData");
    // console.log(`Loading database file at ${userDataPath}/app.db`);
    // this.db = new sqlite3.Database(`${userDataPath}/app.db`);
    // return;
  }

  public async getAllPasswords(): Promise<PasswordEntry[]> {
    console.log(`executing SqlDatabase.getAllPasswords`);
    const rows: PasswordEntry[] = [];
    const db = this.db;

    return new Promise((resolve, reject) => {
      try {
        db.each(
          "SELECT rowid AS id, name, descriptor, password FROM passwords",
          (err, row: PasswordEntry) => {
            if (err instanceof Error) {
              console.error("error", err);
              reject(err.message);
              return;
            }
            rows.push(row);
          },
          (err) => {
            if (err instanceof Error) {
              console.error("error", err);
              reject(err.message);
              return;
            }
            resolve(rows);
          }
        );
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    });
  }

  public async getPassword(id: number): Promise<PasswordEntry[]> {
    const rows: PasswordEntry[] = [];
    const db = this.db;
    db.get(
      `SELECT id, name, password, descriptor FROM passwords WHERE id = ?`,
      id,
      (err: Error, row: PasswordEntry) => {
        if (err instanceof Error) {
          console.error(err.message);
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
      (_: sqlite3.Statement, err: Error) => {
        if (err instanceof Error) {
          console.error(err.message);
        }
      }
    );

    const encrypted = cryptr.encrypt(password, secret);

    stmt.run([name, encrypted, descriptor], (_: unknown, err: Error) => {
      if (err instanceof Error) {
        console.error(err.message);
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
        stmt.run(
          String.fromCharCode("a".charCodeAt(0) + i),
          "password",
          "desc"
        );
      }

      console.log("Finalizing statement...");
      stmt.finalize((err) => {
        if (err instanceof Error) {
          console.error(err.message);
        }
      });
    });
  }

  public closeDb(): void {
    console.log("Closing database... Goodbye.");
    this.db.close();
  }
}
