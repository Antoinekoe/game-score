import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

console.log("=== APP STARTING ===");

const app = express();
const port = process.env.PORT || 3000;

// Basic middleware
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN || "https://game-score-production.up.railway.app",
  })
);

// Simple health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "App is running",
  });
});

// Simple test route
app.get("/test", (req, res) => {
  res.json({
    message: "Test route working!",
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Not set",
      IGDB_CLIENT_ID: process.env.IGDB_CLIENT_ID ? "Set" : "Not set",
      IGDB_AUTHORIZATION: process.env.IGDB_AUTHORIZATION ? "Set" : "Not set",
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV,
    },
  });
});

// Database connection (simplified)
let db;
async function connectDatabase() {
  try {
    console.log("Connecting to database...");
    db = new pg.Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await db.connect();
    console.log("Database connected successfully");

    // Create table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS noted_games (
        id SERIAL PRIMARY KEY,
        game_name VARCHAR(100) NOT NULL,
        note INTEGER CONSTRAINT check_limit CHECK (note >= 0 AND note <=5),
        description VARCHAR(255),
        date_publication DATE,
        img VARCHAR(255),
        date_entry text
      );
    `);
    console.log("Database setup complete");
  } catch (error) {
    console.error("Database connection failed:", error);
    // Continue without database for now
  }
}

// Start server
async function startServer() {
  try {
    await connectDatabase();

    app.listen(port, () => {
      console.log("=== SERVER STARTED ===");
      console.log(`Server running on port ${port}`);
      console.log(
        `Health check: https://game-score-production.up.railway.app/health`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Error handling
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start the server
startServer();
