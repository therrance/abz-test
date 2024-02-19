import { faker } from "@faker-js/faker";
import { Pool } from "pg";
import fetch from "node-fetch";
import fs from "fs";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5432,
});

async function seedDatabase() {
  await createPositionsTableIfNotExists();
  await fillPositionsTable();
  await createUsersTableIfNotExists();
  const positions = await getPositions();

  for (let i = 0; i < 45; i++) {
    const name = faker.person.fullName();
    const email = faker.internet.email();
    const phone = faker.helpers.fromRegExp(/^\+380\d{9}$/);
    const positionId = getRandomPositionId(positions);
    const photoUrl = faker.image.avatar();
    const photo = await downloadImage(photoUrl);

    await pool.query(
      "INSERT INTO users (name, email, phone, position_id, photo) VALUES ($1, $2, $3, $4, $5)",
      [name, email, phone, positionId, photo]
    );
  }

  console.log("Database seeded successfully");
}

async function createPositionsTableIfNotExists() {
  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS positions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL
      )
    `;
  await pool.query(createTableQuery);
}

async function fillPositionsTable() {
  const positions = ["Developer", "Designer", "Manager", "Analyst", "Tester"];
  for (const position of positions) {
    await pool.query("INSERT INTO positions (name) VALUES ($1)", [position]);
  }
}

async function createUsersTableIfNotExists() {
  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        position_id INTEGER NOT NULL,
        photo BYTEA NOT NULL
      )
    `;
  await pool.query(createTableQuery);
}

async function getPositions() {
  const { rows } = await pool.query("SELECT id FROM positions");
  return rows.map((row: any) => row.id);
}

function getRandomPositionId(positions: number[]) {
  return positions[Math.floor(Math.random() * positions.length)];
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const buffer = await response.buffer();
  return buffer;
}

seedDatabase().catch((error) =>
  console.error("Error seeding database:", error)
);
