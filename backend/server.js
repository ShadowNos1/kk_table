import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Генерируем миллион элементов при старте
let allItems = Array.from({ length: 1000000 }, (_, i) => i + 1);
let selectedItems = [];

app.get("/api/items", (req, res) => {
  const filter = req.query.filter || "";
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 20;

  let items = allItems.filter((id) => id.toString().includes(filter));
  res.json(items.slice(offset, offset + limit));
});

app.get("/api/selected", (req, res) => {
  const filter = req.query.filter || "";
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 20;

  let items = selectedItems.filter((id) => id.toString().includes(filter));
  res.json(items.slice(offset, offset + limit));
});

app.post("/api/select", (req, res) => {
  const { id } = req.body;
  const index = allItems.indexOf(id);
  if (index !== -1) {
    allItems.splice(index, 1);
    selectedItems.unshift(id);
  }
  res.sendStatus(200);
});

app.post("/api/unselect", (req, res) => {
  const { id } = req.body;
  const index = selectedItems.indexOf(id);
  if (index !== -1) {
    selectedItems.splice(index, 1);
    allItems.unshift(id);
  }
  res.sendStatus(200);
});

app.post("/api/add", (req, res) => {
  const { id } = req.body;
  if (!allItems.includes(id) && !selectedItems.includes(id)) {
    allItems.unshift(id);
  }
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
