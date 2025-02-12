const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
// require("dotenv").config();
const pg = require("pg");
const client = new pg.Client();
const app = express();
const PORT = 3000;
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server alive on port ${PORT}!!!`);
});

app.get("/api/flavors", async (req, res) => {
  try {
    const SQL = `SELECT * FROM flavors;`;
    const { rows } = await client.query(SQL);
    res.send(rows);
  } catch (err) {
    console.log(err);
  }
});

// GET a single flavor by ID
app.get("/api/flavors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query("SELECT * FROM flavors WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Flavor not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
  }
});

// POST
app.post("/api/flavors", async (req, res) => {
  try {
    const { name, is_favorite } = req.body;
    const result = await client.query(
      "INSERT INTO flavors (name, is_favorite) VALUES ($1, $2) RETURNING *",
      [name, is_favorite]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
  }
});

// PUT
app.put("/api/flavors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_favorite } = req.body;
    const result = await client.query(
      "UPDATE flavors SET name = $1, is_favorite = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [name, is_favorite, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Flavor not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
  }
});

// DELETE
app.delete("/api/flavors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await client.query("DELETE FROM flavors WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.log(err);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to DB");
  let SQL = `
 DROP TABLE IF EXISTS flavors;

    CREATE TABLE flavors (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      is_favorite BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO flavors (name, is_favorite) VALUES
    ('Vanilla', TRUE),
    ('Chocolate', FALSE),
    ('Strawberry', TRUE),
    ('Mint Chocolate Chip', TRUE),
    ('Cookies and Cream', FALSE),
    ('Pistachio', TRUE),
    ('Rocky Road', FALSE);

  `;
  await client.query(SQL);
};

init();
