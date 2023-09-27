import path from "node:path";
import sqlite3 from "sqlite3";
import * as cryptr from "../../lib/cryptr/cryptr";
import { PathLocationName } from "../index";

const sqlite3V = sqlite3.verbose();

export type PasswordEntry = {
  id?: number;
  name: string;
  password: string;
  descriptor: string;
};

export type SqlDatabaseConfig = {
  writablePath?: string;
  writablePathLocationName?: PathLocationName;
};

export class SqlDatabase {
  db: sqlite3.Database;
  dev = false;

  constructor(public readonly config?: SqlDatabaseConfig) {
    if (
      process.env.NODE_ENV !== "development" &&
      config?.writablePath !== undefined
    ) {
      const filePath = path.join(config.writablePath, "/user.db");
      console.log(
        `App started in production mode, starting database at ${filePath} in process ${process.pid}`
      );

      this.db = new sqlite3V.Database(filePath, (err) => {
        if (err !== null) {
          console.error(err);
        }
      });
      console.log(`Connected to the database at ${filePath}`);
      return;
    }

    this.dev = true;
    this.db = new sqlite3V.Database(":memory:", (err) => {
      if (err instanceof Error) {
        return console.error(err.message);
      }
    });
    console.log("Connected to the in memory SQLite Database");
  }

  public async getAllPasswords(): Promise<PasswordEntry[]> {
    console.log(`executing SqlDatabase.getAllPasswords`);
    const rows: PasswordEntry[] = [];
    const db = this.db;

    return new Promise((resolve, reject) => {
      try {
        db.each(
          "SELECT rowid AS id, username, descriptor, password FROM passwords",
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
      `SELECT id, username, password, descriptor FROM passwords WHERE id = ?`,
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

  public async savePassword(
    username: string,
    password: string,
    descriptor: string,
    secret: string
  ): Promise<string> {
    const db = this.db;
    const stmt = db.prepare(
      `INSERT INTO passwords VALUES ($username, $pass, $desc);`,
      (_: sqlite3.Statement, err: Error) => {
        if (err instanceof Error) {
          console.error(err.message);
        }
      }
    );

    console.log(
      `inside SqlDatabase savePassword ${username}, ${password}, ${descriptor}, ${secret}`
    );

    const encrypted = await cryptr.encrypt(password, secret);

    stmt.run([username, encrypted, descriptor], (_: unknown, err: Error) => {
      if (err instanceof Error) {
        console.error(err.message);
      }
    });

    return encrypted
  }

  public addMultiplePasswords(passwords: PasswordEntry[]): void {
    // handle stuff
    console.log(passwords);
  }

  public deletePassword(id: number): void {
    // do stuff
    console.log(id);
  }

  public async initDb(config?: { loadDummyData?: boolean }): Promise<void> {
    console.log("Initalizing SQLite3 Database...");
    const db = this.db;

    /* Reminder: DO NOT PUT A COMMA ON LAST ROW FIELD 
    OTHERWISE IT IS A SYNTAX ERROR AND IT WILL
    CRASH THE DB AND THE CHILD PROCESS!!! */
    try {
      db.serialize(() => {
        db.run(
          `CREATE TABLE IF NOT EXISTS passwords (
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            descriptor TEXT
            );`,
          (_runResult: sqlite3.RunResult, err: Error) => {
            if (err instanceof Error) {
              console.error(err);
            }
          }
        );
      });

      if (config?.loadDummyData) {
        this.loadDummyData();
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(err);
      }
    }
  }

  public closeDb(): void {
    console.log("Closing database... Goodbye.");
    this.db.close();
  }

  private loadDummyData(): void {
    const db = this.db;
    try {
      console.log("Now preparing insert statement...");
      const stmt = db.prepare(
        `INSERT INTO passwords VALUES ($username, $pass, $desc);`
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
    } catch (err) {
      if (err instanceof Error) {
        console.error(err);
      }
    }
  }
}
