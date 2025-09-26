import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// --- in-memory storage ---
let allItems = Array.from({ length: 1000000 }, (_, i) => i + 1);
let selectedItems = [];

// --- Serve React build ---
app.use(express.static(path.join(__dirname, "../frontend/build")));

// --- API: get all items with optional filter ---
app.get("/api/items", (req, res) => {
  const { filter = "", offset = 0, limit = 20 } = req.query;
  const filtered = allItems
    .filter((id) => !selectedItems.includes(id))
    .filter((id) => id.toString().includes(filter))
    .slice(Number(offset), Number(offset) + Number(limit));
  res.json(filtered);
});

// --- API: get selected items with optional filter ---
app.get("/api/selected", (req, res) => {
  const { filter = "", offset = 0, limit = 20 } = req.query;
  const filtered = selectedItems
    .filter((id) => id.toString().includes(filter))
    .slice(Number(offset), Number(offset) + Number(limit));
  res.json(filtered);
});

// --- API: select an item ---
app.post("/api/select", (req, res) => {
  const { id } = req.body;
  const itemId = Number(id);
  if (!selectedItems.includes(itemId)) {
    selectedItems.push(itemId);
  }
  res.json({ success: true });
});

// --- API: unselect an item ---
app.post("/api/unselect", (req, res) => {
  const { id } = req.body;
  const itemId = Number(id);
  selectedItems = selectedItems.filter((i) => i !== itemId);
  res.json({ success: true });
});

// --- API: add a new item ---
app.post("/api/add", (req, res) => {
  const { id } = req.body;
  const itemId = Number(id);
  if (!allItems.includes(itemId) && !selectedItems.includes(itemId)) {
    allItems.push(itemId);
  }
  res.json({ success: true });
});

// --- Catch-all to serve React ---
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
