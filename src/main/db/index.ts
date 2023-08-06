import { app } from "electron";
import sqlite3 from "sqlite3";
console.log(process.env.NODE_ENV);

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

    if (process.env.NODE_ENV === "development") {
      console.log(`Starting in-memory database`);
      this.db = new sqlite3.Database(":memory:");
      return;
    }

    // try to load existing database file
    // TODO: find a way to get electron to write a new folder to either
    // "userData" or "appData" paths

    this.db = new sqlite3.Database(`${app.getPath("userData")}/app.db`);
    console.log(`Loading database file at ${app.getPath("userData")}/app.db`);
    return;
  }

  public static get instance(): SqlDatabase {
    // To prevent instantiation of separate database instances
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
        `CREATE TABLE IF NOT EXISTS passwords (
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
