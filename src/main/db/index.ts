import * as sqlite3 from "sqlite3";

export class SqlDatabase {
  static #instance: SqlDatabase;
  private db: sqlite3.Database;
  private constructor() {
    this.db = new sqlite3.Database(":memory:");
  }

  public static get instance(): SqlDatabase {
    if (!this.#instance) {
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

      console.log("Table created, now preparing insert statement");
      const stmt = db.prepare(`INSERT INTO passwords VALUES ($desc, $pass);`);

      for (let i = 0; i < 10; i++) {
        stmt.run(i, i);
      }

      console.log("Finalizing statement");
      stmt.finalize();

      db.each(
        "SELECT rowid AS id, descriptor, password FROM passwords",
        (_, row: { id: string; descriptor: string; password: string }) => {
          console.log(row);
        }
      );
    });
  }

  public closeDb(): void {
    this.db.close();
  }
}
