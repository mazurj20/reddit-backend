const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const { send } = require("process");
const { Pool } = require("pg");

//middleware
app.use(cors());
app.use(express.json()); // allows access to req.body

// connection
const connection = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

//routes
// home
app.get("/", (req, res) => {
  res.send("Welcome");
});

// connection
app.get("/db", async (req, res) => {
  try {
    const client = await connection.connect();
    const result = await client.query("SELECT * FROM user_table");
    res.send(result);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.post("/dbx", async (req, res) => {
  try {
    const client = await connection.connect();
    const email = "test.gmail";
    const newUser = await client.query(
      "INSERT INTO user_table (email) VALUES ($1) RETURNING *",
      [email]
    );
    res.json(newUser.rows[0]);
    client.release();
  } catch (err) {
    console.error(err.message);
  }
});
// get all users
app.get("/users", async (req, res) => {
  try {
    const client = await connection.connect();
    const allUsers = await client.query("SELECT * FROM user_table");
    res.json(allUsers.rows);
    client.release();
  } catch (err) {
    console.error(err.message);
  }
});

// get one user
app.get("/users/:id", async (req, res) => {
  try {
    const client = await connection.connect();

    const { id } = req.params;
    const user = await pool.query(
      "SELECT * FROM user_table WHERE user_id = $1",
      [id]
    );
    res.json(user.rows);
    client.release();
  } catch (err) {
    console.error(err.message);
  }
});

// create user
app.post("/users", async (req, res) => {
  try {
    const client = await connection.connect();

    const { email } = req.body;
    const newUser = await pool.query(
      "INSERT INTO user_table (email) VALUES ($1) RETURNING *",
      [email]
    );
    res.json(newUser.rows[0]);
    client.release();
  } catch (err) {
    console.error(err.message);
  }
});

// update user, we wont use this for users though
app.put("/users/:id", async (req, res) => {
  try {
    const client = await connection.connect();

    const { id } = req.params;
    const { email } = req.body;
    const updatedUser = await pool.query(
      "UPDATE user_table SET email = $1 WHERE user_id = $2",
      [email, id]
    );
    res.json("User was updated");
    client.release();
  } catch (err) {
    console.error(err.message);
  }
});

// delete a user
app.delete("/users/:id", async (req, res) => {
  try {
    const client = await connection.connect();

    const { id } = req.params;
    const deleteUser = await pool.query(
      "DELETE FROM user_table WHERE user_id = $1",
      [id]
    );
    res.json("User was deleted");
    client.release();
  } catch (err) {
    console.error(err.message);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
