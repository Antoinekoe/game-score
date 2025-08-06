import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS configuration for frontend localhost
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000", // Your main URL site
  })
);

// Proxy for public API
app.use(
  "/api",
  createProxyMiddleware({
    target: "https://api.igdb.com/v4", // IGDB API
    changeOrigin: true,
    pathRewrite: {
      "^/api": "", // Delete the '/api'
    },
    onProxyRes: (proxyRes, req, res) => {
      proxyRes.headers["Access-Control-Allow-Origin"] =
        process.env.CORS_ORIGIN || "http://localhost:3000"; // The URL of the frontend
    },
  })
);

app.listen(5000, () => {
  console.log("Proxy server started on port 5000");
});

export default proxyApp;
