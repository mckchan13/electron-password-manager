import * as sqlite3 from "sqlite3";

export async function startDb() {
  const db = new sqlite3.Database(":memory:");

  db.serialize(() => {
    db.run(`CREATE TABLE passwords (
    descriptor TEXT NOT NULL, 
    password TEXT NOT NULL
    )`);

    console.log("Table created, now preparing insert statement");
    const stmt = db.prepare(`INSERT INTO passwords VALUES ($desc, $pass);`);

    for (let i = 0; i < 10; i++) {
      stmt.run(i, i);
    }

    console.log("finalizing statement");
    stmt.finalize();

    db.each(
      "SELECT rowid AS id, descriptor, password FROM passwords",
      (_, row: { id: string; descriptor: string; password: string }) => {
        console.log(row);
      }
    );
  });

  db.close();
}
