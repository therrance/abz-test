import express, { Request, Response } from "express";
import cors from "cors";
import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5432,
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/users", async (req: Request, res: Response) => {
  const { rows } = await pool.query("SELECT * FROM users");
  res.json(rows);
});

app.post("/users", async (req: Request, res: Response) => {
  const { name, email, age } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING *",
    [name, email, age]
  );
  res.json(rows[0]);
});

app.put("/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, age } = req.body;
  const { rows } = await pool.query(
    "UPDATE users SET name = $1, email = $2, age = $3 WHERE id = $4 RETURNING *",
    [name, email, age, id]
  );
  res.json(rows[0]);
});

app.delete("/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
  res.json({ message: "User deleted" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
