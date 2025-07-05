import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// IGDB API configuration for game data retrieval
const igdbApi = axios.create({
  baseURL: process.env.IGDB_PROXY_URL,
  headers: {
    "Client-ID": process.env.IGDB_CLIENT_ID, // Your client ID
    Authorization: `Bearer ${process.env.IGDB_AUTHORIZATION}`, // Your authorization
  },
});

app.use(express.static("public"));
app.set("view engine", "ejs");

// Database connection configuration
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
db.connect();

// Global state variables
let filter = null; // Current active filter for the game list
let gameName = null; // Selected game name for adding/editing
let gameCover = null; // Selected game cover URL
let gameDate = null; // Selected game release date
let isEntriesInDB = false; // Flag indicating if database has entries
let filterContent = null; // Cached filtered results
let checkIfAlreadyIn = null; // Flag for duplicate game check

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Home page - displays all games with optional filtering
app.get("/", async (req, res) => {
  let result;
  try {
    // Use cached filtered results if available, otherwise fetch from DB
    if (filterContent !== null) {
      result = filterContent;
    } else {
      result = await db.query(
        "SELECT * FROM noted_games ORDER BY date_entry DESC"
      );
    }

    // Render page with appropriate data based on whether entries exist
    if (result.rows.length > 0) {
      isEntriesInDB = true;
      res.render("index.ejs", {
        filter: filter,
        isEntriesInDB: true,
        resultDB: result.rows,
        checkIfAlreadyIn: false,
      });
    } else {
      res.render("index.ejs", {
        filter: filter,
        isEntriesInDB: false,
        checkIfAlreadyIn: false,
      });
    }
  } catch (error) {
    console.error("Database query error:", error);
  }
});

// Handle filter requests and update cached results
app.post("/filter", async (req, res) => {
  try {
    const filterType = req.body.filter;

    // Apply different sorting based on filter type
    if (filterType === "oldestToNewest") {
      const result = await db.query(
        "SELECT * FROM noted_games ORDER BY date_entry ASC"
      );
      filter = "oldestToNewest";
      filterContent = result;
    } else if (filterType === "newestToOldest") {
      const result = await db.query(
        "SELECT * FROM noted_games ORDER BY date_entry DESC"
      );
      filter = "newestToOldest";
      filterContent = result;
    } else if (filterType === "bestNoteToWorstNote") {
      const result = await db.query(
        "SELECT * FROM noted_games ORDER BY note DESC"
      );
      filter = "bestNoteToWorstNote";
      filterContent = result;
    } else if (filterType === "worstNoteToBestNote") {
      const result = await db.query(
        "SELECT * FROM noted_games ORDER BY note ASC"
      );
      filter = "worstNoteToWorstNote";
      filterContent = result;
    }
    res.redirect("/");
  } catch (error) {
    console.error("Filter error:", error);
  }
});

// Search games using IGDB API
app.post("/search", async (req, res) => {
  try {
    const searchTerm = req.body.search;
    // Query IGDB API for game data (name, cover, release date)
    const igdbResponse = await igdbApi.post(
      "/games",
      `search "${searchTerm}"; fields name, cover.image_id, first_release_date; where parent_game = null; limit 4;`
    );
    res.json(igdbResponse.data);
  } catch (error) {
    console.error("IGDB API error:", error);
  }
});

// Store selected game data and render add game form
app.post("/chooseGame", async (req, res) => {
  try {
    // Store game details in global variables for form population
    gameName = req.body.gameName;
    gameCover = req.body.gameCover;
    gameDate = req.body.gameDate;
    res.render("addGame.ejs", {
      gameName: gameName,
      gameCover: gameCover,
      gameDate: gameDate,
      checkIfAlreadyIn: false,
    });
  } catch (error) {
    console.error("Game selection error:", error);
  }
});

// Display add game form (GET request)
app.get("/chooseGame", async (req, res) => {
  try {
    res.render("addGame.ejs");
  } catch (error) {
    console.error("Add game page error:", error);
  }
});

// Add new game to database
app.post("/addGame", async (req, res) => {
  try {
    // Check if game already exists in database
    const check = await db.query(
      "SELECT * FROM noted_games WHERE game_name = $1",
      [gameName]
    );

    if (check.rows.length > 0) {
      // Game already exists - show error message
      checkIfAlreadyIn = true;
      res.render("addGame.ejs", {
        checkIfAlreadyIn: checkIfAlreadyIn,
        gameName: gameName,
        gameCover: gameCover,
        gameDate: gameDate,
      });
    } else {
      // Insert new game into database
      let dateEntry = new Date();
      let gameNote = req.body.selectNote;
      let gameComment = req.body.commentaire;

      const result = await db.query(
        "INSERT INTO noted_games (game_name, note, description, date_publication, img, date_entry) VALUES ($1, $2, $3, $4, $5, $6)",
        [gameName, gameNote, gameComment, gameDate, gameCover, dateEntry]
      );

      // Clear cached data and redirect to home
      filterContent = null;
      checkIfAlreadyIn = false;
      res.redirect("/");
    }
  } catch (error) {
    console.error("Add game error:", error);
  }
});

// Display edit form for specific game
app.get("/edit/:id", async (req, res) => {
  try {
    let idOfTheReview = req.params.id;
    // Fetch game data for editing
    const result = await db.query("SELECT * FROM noted_games WHERE id=$1", [
      idOfTheReview,
    ]);
    res.render("editGame.ejs", {
      resultRows: result.rows,
    });
    filterContent = null; // Clear cache to refresh home page
  } catch (error) {
    console.error("Edit page error:", error);
  }
});

// Update game review in database
app.post("/edit/:id", async (req, res) => {
  try {
    let newNote = req.body.selectNote;
    let newDescription = req.body.commentaire;
    let idToSelect = req.params.id;

    // Update game review
    const result = await db.query(
      "UPDATE noted_games SET note = $1, description = $2 WHERE id = $3",
      [newNote, newDescription, idToSelect]
    );

    filterContent = null; // Clear cache to refresh home page
    res.redirect("/");
  } catch (error) {
    console.error("Update error:", error);
  }
});

// Delete game review from database
app.post("/delete/:id", async (req, res) => {
  try {
    const result = await db.query("DELETE FROM noted_games WHERE id=$1", [
      req.params.id,
    ]);
    filterContent = null; // Clear cache to refresh home page
    res.redirect("/");
  } catch (error) {
    console.error("Delete error:", error);
  }
});

// Display contact page
app.get("/contact", async (req, res) => {
  try {
    res.render("contact.ejs");
  } catch (error) {
    console.error("Contact page error:", error);
  }
});

// Start server
app.listen(port, () => {
  console.log(`Website is running at http://localhost:${port}`);
});
