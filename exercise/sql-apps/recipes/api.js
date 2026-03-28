const path = require("path");
const express = require("express");
const router = express.Router();
const pg = require("pg");

// client side static assets
router.get("/", (_, res) => res.sendFile(path.join(__dirname, "./index.html")));
router.get("/client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./client.js"))
);
router.get("/detail-client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./detail-client.js"))
);
router.get("/style.css", (_, res) =>
  res.sendFile(path.join(__dirname, "../style.css"))
);
router.get("/detail", (_, res) =>
  res.sendFile(path.join(__dirname, "./detail.html"))
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

router.get("/search", async function (req, res) {
  console.log("search recipes");

  // return recipe_id, title, and the first photo as url
  //
  // for recipes without photos, return url as default.jpg

  const result = await pool.query(`
    SELECT DISTINCT ON (r.recipe_id) 
    r.recipe_id, r.title, COALESCE(rp.url, 'default.jpg') AS url 
    FROM
    recipes r
    LEFT JOIN
    recipes_photos rp
    ON
    r.recipe_id = rp.recipe_id;
  `);

  console.log(result);

  res.status(200).json({ status: "success", rows: result.rows });
});

router.get("/get", async (req, res) => {
  const recipeId = req.query.id ? +req.query.id : 1;
  console.log("recipe get", recipeId);

  // return all ingredient rows as ingredients
  //    name the ingredient image `ingredient_image`
  //    name the ingredient type `ingredient_type`
  //    name the ingredient title `ingredient_title`
  //
  //
  const ingredientsPromise = pool.query(
    `
      SELECT 
      i.title AS ingredient_title,
      i.type AS ingredient_type,
      i.image AS ingredient_image
      FROM
       recipe_ingredients ri
      INNER JOIN
        ingredients i
      ON
        i.id = ri.ingredient_id
      WHERE
        ri.recipe_id = $1;
      ;
    `,
    [recipeId]
  );

  // return all photo rows as photos
  //    return the title, body, and url (named the same)
  //
  //

  const photosPromise = pool.query(
    `
    SELECT COALESCE(p.url, 'default.png') AS url FROM recipes_photos p WHERE p.recipe_id = $1
    `,
    [recipeId]
  );

  const recipePromise = pool.query(
    `SELECT title, body FROM recipes WHERE recipes.recipe_id=$1`,
    [recipeId]
  );

  const [{ rows: ingredients }, { rows: photos }, { rows: recipe }] =
    await Promise.all([ingredientsPromise, photosPromise, recipePromise]);

  console.log("recipe", recipe, ingredients, photos);

  // return the title as title
  // return the body as body
  // if no row[0] has no photo, return it as default.jpg

  res.status(200).json({
    status: "success",
    ingredients,
    photos: photos?.map((photo) => photo.url),
    title: recipe?.[0]?.title,
    body: recipe?.[0]?.body,
  });
});
/**
 * Student code ends here
 */

module.exports = router;
