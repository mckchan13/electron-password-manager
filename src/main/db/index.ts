import { app } from "electron";
import sqlite3 from "sqlite3";

export class SqlDatabase {
  static #isInternalConstructing = false;
  static #instance: SqlDatabase;
  private db: sqlite3.Database;
  public constructor(public userSpecifiedDbPath?: string) {
    if (!SqlDatabase.#isInternalConstructing) {
      throw new TypeError(
        "Private SqlDatabase constructor is not constructable"
      );
    }
    SqlDatabase.#isInternalConstructing = false;
    if (!userSpecifiedDbPath) {
      console.log(
        `No database path specified, starting in memory database. 
        All data will be lost when application is closed.`
      );
      this.db = new sqlite3.Database(":memory:");
      return;
    }
    this.userSpecifiedDbPath = userSpecifiedDbPath;
    this.db = new sqlite3.Database(`${app.getPath("userData")}/userdb/app.db`);
  }

  public static get instance(): SqlDatabase {
    if (!this.#instance) {
      SqlDatabase.#isInternalConstructing = true;
      return new SqlDatabase();
    }

    return this.#instance;
  }

  public initDb(): void {
    const db = this.db;

    db.serialize(() => {
      db.run(
        `CREATE TABLE passwords (
          descriptor TEXT NOT NULL, 
          password TEXT NOT NULL
          )`
      );

      console.log("Table created, now preparing insert statement...");
      const stmt = db.prepare(`INSERT INTO passwords VALUES ($desc, $pass);`);

      for (let i = 0; i < 10; i++) {
        stmt.run(i, i);
      }

      console.log("Finalizing statement...");
      stmt.finalize();

      db.each(
        "SELECT rowid AS id, descriptor, password FROM passwords",
        (err, row: { id: string; descriptor: string; password: string }) => {
          if (err) {
            console.error(err);
          }
          console.log(row);
        }
      );
    });
  }

  public closeDb(): void {
    this.db.close();
  }
}
