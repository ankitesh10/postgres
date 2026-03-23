const path = require("path");
const express = require("express");
const router = express.Router();
const pg = require("pg");

// client side static assets
router.get("/", (_, res) => res.sendFile(path.join(__dirname, "./index.html")));
router.get("/client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./client.js"))
);

/**
 * Student code starts here
 */

// connect to postgres

const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "recipeguru",
  password: "lol",
  port: 5432,
});

router.get("/type", async (req, res) => {
  const { type } = req.query;
  console.log("get ingredients", type);

  const result = await pool.query(`SELECT * FROM ingredients WHERE type=$1`, [
    type,
  ]);

  console.log("rows", result.rows);

  // return all ingredients of a type

  res.status(200).json({ status: "success", rows: result.rows });
});

router.get("/search", async (req, res) => {
  let { term, page } = req.query;
  page = page ? page : 0;
  console.log("search ingredients", term, page);

  const LIMIT = 10;
  const OFFSET = LIMIT * page;

  const result = await pool.query(
    `SELECT *, COUNT(*) OVER ()::INT AS total_count FROM ingredients WHERE title ILIKE $1 LIMIT $2 OFFSET $3`,
    [`%${term}%`, LIMIT, OFFSET]
  );

  // return all columns as well as the count of all rows as total_count
  // make sure to account for pagination and only return 5 rows at a time

  res.status(200).json({ status: "sucess", rows: result.rows });
});

/**
 * Student code ends here
 */

module.exports = router;
