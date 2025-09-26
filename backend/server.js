// backend/server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Массив всех элементов (для примера 1..100)
let allItems = Array.from({ length: 100 }, (_, i) => i + 1);
let selectedItems = [];

app.get("/", (req, res) => {
  res.send("API running");
});

// Получение всех элементов с фильтром и пагинацией
app.get("/api/items", (req, res) => {
  const { filter = "", offset = 0, limit = 20 } = req.query;
  const filtered = allItems.filter(
    (id) => id.toString().includes(filter)
  );
  const sliced = filtered.slice(Number(offset), Number(offset) + Number(limit));
  res.json(sliced);
});

// Получение выбранных элементов с фильтром и пагинацией
app.get("/api/selected", (req, res) => {
  const { filter = "", offset = 0, limit = 20 } = req.query;
  const filtered = selectedItems.filter(
    (id) => id.toString().includes(filter)
  );
  const sliced = filtered.slice(Number(offset), Number(offset) + Number(limit));
  res.json(sliced);
});

// Выбор элемента
app.post("/api/select", (req, res) => {
  const { id } = req.body;
  const parsedId = Number(id);
  if (!allItems.includes(parsedId)) return res.status(400).json({ error: "Item not found" });
  allItems = allItems.filter((i) => i !== parsedId);
  selectedItems.unshift(parsedId);
  res.json({ success: true });
});

// Снятие выбора
app.post("/api/unselect", (req, res) => {
  const { id } = req.body;
  const parsedId = Number(id);
  if (!selectedItems.includes(parsedId)) return res.status(400).json({ error: "Item not selected" });
  selectedItems = selectedItems.filter((i) => i !== parsedId);
  allItems.unshift(parsedId);
  res.json({ success: true });
});

// Добавление нового элемента с указанным ID
app.post("/api/add", (req, res) => {
  const { id } = req.body;
  const parsedId = Number(id);
  if (allItems.includes(parsedId) || selectedItems.includes(parsedId)) {
    return res.status(400).json({ error: "ID already exists" });
  }
  allItems.unshift(parsedId);
  res.json({ success: true });
});

// Любой другой путь
app.use((req, res) => {
  res.status(404).send("Not Found");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
