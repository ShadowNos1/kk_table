import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// --- Виртуальный миллион элементов ---
const TOTAL_ITEMS = 1_000_000;
let selectedItems = [];
const createItem = (id) => ({ id });

// --- API ---
app.get("/api/items", (req, res) => {
  const filter = req.query.filter || "";
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 20;

  let items = [];
  let count = 0;
  let id = 1;

  while (items.length < limit && id <= TOTAL_ITEMS) {
    if (!selectedItems.includes(id) && id.toString().includes(filter)) {
      if (count >= offset) items.push(createItem(id));
      count++;
    }
    id++;
  }

  res.json(items);
});

app.get("/api/selected", (req, res) => {
  const filter = req.query.filter || "";
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 20;

  const filtered = selectedItems
    .filter((id) => id.toString().includes(filter))
    .slice(offset, offset + limit)
    .map(createItem);

  res.json(filtered);
});

app.post("/api/select", (req, res) => {
  const { id } = req.body;
  if (!selectedItems.includes(id)) selectedItems.push(id);
  res.json({ success: true });
});

app.post("/api/unselect", (req, res) => {
  const { id } = req.body;
  selectedItems = selectedItems.filter((i) => i !== id);
  res.json({ success: true });
});

app.post("/api/add", (req, res) => {
  const { id } = req.body;
  res.json({ success: true });
});

// --- Статические файлы React ---
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "frontend/build")));

// --- Catch-all для SPA ---
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
