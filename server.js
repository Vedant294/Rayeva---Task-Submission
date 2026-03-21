import express from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API routes — import handlers directly
import categoryHandler from "./api/category.js";
import proposalHandler from "./api/proposal.js";
import impactHandler from "./api/impact.js";
import dashboardHandler from "./api/dashboard.js";
import logsHandler from "./api/logs.js";

app.post("/api/category", (req, res) => categoryHandler(req, res));
app.post("/api/proposal", (req, res) => proposalHandler(req, res));
app.post("/api/impact", (req, res) => impactHandler(req, res));
app.get("/api/dashboard", (req, res) => dashboardHandler(req, res));
app.get("/api/logs", (req, res) => logsHandler(req, res));

// Serve static frontend
const distPath = join(__dirname, "frontend", "dist");
app.use(express.static(distPath));

// Catch-all for React Router (must be last)
app.use((req, res) => {
  res.sendFile(join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Rayeva running at http://localhost:${PORT}`);
});
