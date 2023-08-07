import { app } from "electron";
import sqlite3 from "sqlite3";

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
      console.log(`Starting in-memory database`);
      this.db = new sqlite3.Database(":memory:");
      return;
    }

    // try to load existing database file
    // TODO: find a way to get electron to write a new folder to either
    // "userData" or "appData" paths
    const userDataPath = app.getPath("userData");
    console.log(`Loading database file at ${userDataPath}/app.db`);
    this.db = new sqlite3.Database(`${userDataPath}/app.db`);
    return;
  }

  public static get instance(): SqlDatabase {
    // To prevent instantiation of separate database instances
    console.log("Getting #instance:", this.#instance);
    if (!this.#instance) {
      SqlDatabase.#isInternalConstructing = true;
      this.#instance = new SqlDatabase();
    }

    return this.#instance;
  }

  public initDb(): void {
    console.log("Initalizing SQLite3 Database...");
    const db = this.db;

    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS passwords (
          descriptor TEXT NOT NULL UNIQUE, 
          password TEXT NOT NULL
          );`
      );

      console.log("Table created, now preparing insert statement...");
      const stmt = db.prepare(`INSERT INTO passwords VALUES ($desc, $pass);`);

      for (let i = 0; i < 10; i++) {
        stmt.run(i, String.fromCharCode("a".charCodeAt(0) + i));
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
