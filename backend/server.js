import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Генерируем 1 миллион элементов {id: 1..1000000}
const TOTAL_ITEMS = 1000000;
const allItems = Array.from({ length: TOTAL_ITEMS }, (_, i) => ({ id: i + 1 }));
let selectedItems = [];

// GET /items?start=0&limit=20&filter=10
app.get("/items", (req, res) => {
  let { start = 0, limit = 20, filter = "" } = req.query;
  start = parseInt(start, 10);
  limit = parseInt(limit, 10);
  let items = allItems.filter((i) => !selectedItems.find((s) => s.id === i.id));
  if (filter) items = items.filter((i) => String(i.id).includes(filter));
  const page = items.slice(start, start + limit);
  res.json(page);
});

// GET /selected?start=0&limit=20&filter=10
app.get("/selected", (req, res) => {
  let { start = 0, limit = 20, filter = "" } = req.query;
  start = parseInt(start, 10);
  limit = parseInt(limit, 10);
  let items = [...selectedItems];
  if (filter) items = items.filter((i) => String(i.id).includes(filter));
  const page = items.slice(start, start + limit);
  res.json(page);
});

// POST /select {id: 123}
app.post("/select", (req, res) => {
  const { id } = req.body;
  const idx = allItems.findIndex((i) => i.id === id);
  if (idx !== -1 && !selectedItems.find((s) => s.id === id)) {
    selectedItems.unshift(allItems[idx]);
  }
  res.sendStatus(200);
});

// POST /unselect {id: 123}
app.post("/unselect", (req, res) => {
  const { id } = req.body;
  selectedItems = selectedItems.filter((i) => i.id !== id);
  res.sendStatus(200);
});

// POST /add {id: 12345}
app.post("/add", (req, res) => {
  const { id } = req.body;
  if (!allItems.find((i) => i.id === id)) {
    allItems.unshift({ id });
  }
  res.sendStatus(200);
});

// POST /reorder {ids: [..]}
app.post("/reorder", (req, res) => {
  const { ids } = req.body;
  selectedItems.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
