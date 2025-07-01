import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;
app.set("view engine", "ejs");

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "gamescore",
  password: "", // PUT YOUR PASSWORD HERE
  port: 5432,
});
db.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    res.render("index.ejs");
  } catch (error) {
    console.error("Erreur:", error);
  }
});

app.listen(port, () => {
  console.log(`Website is running at http://localhost:${port}`);
});
