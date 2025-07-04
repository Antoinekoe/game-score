import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;
const igdbApi = axios.create({
  // Create the auth required to make a IGBD API request
  baseURL: "http://localhost:5000/api",
  headers: {
    "Client-ID": "x696mg2de9d61sgz5f27b9z53gr8ly",
    Authorization: "Bearer v2yt8qb3pq4kc6faivvcd3lqtkqkgh",
  },
});

app.use(express.static("public"));
app.set("view engine", "ejs");

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "gamescore",
  password: "2112Nono$", // PUT YOUR PASSWORD HERE
  port: 5432,
});
db.connect();

let filter = null; // Declare the filter that will be useful for the frontend to filter the field
let gameName = null; // Declare the var that stores the gameName
let gameCover = null; // Declare the var that stores the gameCover URL
let gameDate = null; // Declare the var that stores the gameDate, in a readable format
let isEntriesInDB = false; // Declaration if there are entries or not in the DB
let filterContent = null; // Declare the var that will store the result of the DB filters

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  // Home page linked to DB
  let result;
  try {
    if (filterContent !== null) {
      result = filterContent;
    } else {
      result = await db.query(
        "SELECT * FROM noted_games ORDER BY date_publication ASC"
      );
    }
    if (result.rows.length > 0) {
      isEntriesInDB = true;
      res.render("index.ejs", {
        filter: filter,
        isEntriesInDB: true,
        resultDB: result.rows,
      });
    } else {
      res.render("index.ejs", {
        filter: filter,
        isEntriesInDB: false,
      });
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
});

app.post("/filter", async (req, res) => {
  // If a user click on a filter, request the DB to filter data
  try {
    if (req.body.filter === "oldestToNewest") {
      const result = await db.query(
        "SELECT * FROM noted_games ORDER BY date_entry ASC"
      );
      filter = "oldestToNewest";
      filterContent = result;
    } else if (req.body.filter === "newestToOldest") {
      const result = await db.query(
        "SELECT * FROM noted_games ORDER BY date_entry DESC"
      );
      filter = "newestToOldest";
      filterContent = result;
    } else if (req.body.filter === "bestNoteToWorstNote") {
      const result = await db.query(
        "SELECT * FROM noted_games ORDER BY note DESC"
      );
      filter = "bestNoteToWorstNote";
      filterContent = result;
    } else if (req.body.filter === "worstNoteToBestNote") {
      const result = await db.query(
        "SELECT * FROM noted_games ORDER BY note ASC"
      );
      filter = "worstNoteToBestNote";
      filterContent = result;
    }
    res.redirect("/");
  } catch (error) {
    console.error("Error:", error);
  }
});

app.post("/search", async (req, res) => {
  // Searching function
  try {
    const searchTerm = req.body.search;
    const igdbResponse = await igdbApi.post(
      "/games",
      `search "${searchTerm}"; fields name, cover.url, first_release_date; where parent_game = null; limit 4;`
    );
    res.json(igdbResponse.data);
  } catch (error) {
    console.error("Erreur de récupération des données de IGDB", error);
  }
});

app.post("/chooseGame", async (req, res) => {
  // If a user click on a game, store the request
  try {
    gameName = req.body.gameName;
    gameCover = req.body.gameCover;
    gameDate = req.body.gameDate;
    res.render("addGame.ejs", {
      gameName: gameName,
      gameCover: gameCover,
      gameDate: gameDate,
    });
  } catch (error) {
    console.error("Erreur:", error);
  }
});

app.get("/chooseGame", async (req, res) => {
  // Shows the addGame page with the request
  try {
    res.render("addGame.ejs");
  } catch (error) {
    console.error("Erreur:", error);
  }
});

app.post("/addGame", async (req, res) => {
  // Add the game in the DB and redirect to home page
  try {
    let dateEntry = new Date();
    let gameNote = req.body.selectNote;
    let gameComment = req.body.commentaire;
    const result = await db.query(
      "INSERT INTO noted_games (game_name, note, description, date_publication, img, date_entry) VALUES ($1, $2, $3, $4, $5, $6)",
      [gameName, gameNote, gameComment, gameDate, gameCover, dateEntry]
    );
    filterContent = null;
    res.redirect("/");
  } catch (error) {
    console.error("Erreur:", error);
  }
});

app.get("/edit/:id", async (req, res) => {
  // Shows the editGame page with the params sent from the button edit on home page
  try {
    let idOfTheReview = req.params.id;
    const result = await db.query("SELECT * FROM noted_games WHERE id=$1", [
      idOfTheReview,
    ]);
    res.render("editGame.ejs", {
      resultRows: result.rows,
    });
    filterContent = null;
  } catch (error) {
    console.error("Erreur:", error);
  }
});

app.post("/edit/:id", async (req, res) => {
  // Modify the review in the DB and redirect to home page
  try {
    let newNote = req.body.selectNote;
    let newDescription = req.body.commentaire;
    let idToSelect = req.params.id;
    const result = await db.query(
      "UPDATE noted_games SET note = $1, description = $2 WHERE id = $3",
      [newNote, newDescription, idToSelect]
    );
    filterContent = null;
    res.redirect("/");
  } catch (error) {
    console.error("Erreur:", error);
  }
});

app.post("/delete/:id", async (req, res) => {
  // Delete review on home page
  try {
    const result = await db.query("DELETE FROM noted_games WHERE id=$1", [
      req.params.id,
    ]);
    filterContent = null;
    res.redirect("/");
  } catch (error) {
    console.error("Erreur:", error);
  }
});

app.get("/contact", async (req, res) => {
  // Shows the contact form
  try {
    res.render("contact.ejs");
  } catch (error) {
    console.error("Erreur:", error);
  }
});

app.listen(port, () => {
  console.log(`Website is running at http://localhost:${port}`);
});
