import { Sequelize, Model, DataTypes } from "sequelize";
import { faker } from "@faker-js/faker";
import fetch from "node-fetch";

const sequelize = new Sequelize({
  database: "postgres",
  username: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  dialect: "postgres",
});

class Position extends Model {}
Position.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, modelName: "position" }
);

class User extends Model {}
User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    positionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    photo: {
      type: DataTypes.BLOB,
      allowNull: false,
    },
  },
  { sequelize, modelName: "user" }
);

async function seedDatabase() {
  await sequelize.sync({ force: true });

  await fillPositionsTable();
  const positions = (await Position.findAll()).map(
    (position: any) => position.id
  );

  for (let i = 0; i < 45; i++) {
    const name = faker.person.fullName();
    const email = faker.internet.email();
    const phone = faker.helpers.fromRegExp(/\+380[0-9]{9}/);
    const positionId = getRandomPositionId(positions);
    const photoUrl = faker.image.avatar();
    const photo = await downloadImage(photoUrl);

    await User.create({ name, email, phone, positionId, photo });
  }

  console.log("Database seeded successfully");
}

async function fillPositionsTable() {
  const positions = ["Developer", "Designer", "Manager", "Analyst", "Tester"];
  for (const position of positions) {
    await Position.create({ name: position });
  }
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
