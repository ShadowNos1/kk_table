import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Хранилище в памяти
let allItems = Array.from({ length: 1000000 }, (_, i) => i + 1);
let selectedItems = [];

// Очередь для дедупликации добавлений
let addQueue = new Set();
setInterval(() => {
  if (addQueue.size) {
    addQueue.forEach((id) => {
      if (!allItems.includes(id) && !selectedItems.includes(id)) allItems.push(id);
    });
    addQueue.clear();
  }
}, 10000);

// Получение элементов с фильтром и пагинацией
app.get("/items", (req, res) => {
  let { start = 0, limit = 20, filter = "" } = req.query;
  start = parseInt(start);
  limit = parseInt(limit);

  let filtered = allItems.filter(
    (id) => !selectedItems.includes(id) && id.toString().includes(filter)
  );
  filtered.sort((a, b) => a - b);
  res.json(filtered.slice(start, start + limit));
});

app.get("/selected", (req, res) => {
  let { start = 0, limit = 20, filter = "" } = req.query;
  start = parseInt(start);
  limit = parseInt(limit);

  let filtered = selectedItems.filter((id) => id.toString().includes(filter));
  res.json(filtered.slice(start, start + limit));
});

// Выбрать элемент
app.post("/select", (req, res) => {
  const { id } = req.body;
  if (!selectedItems.includes(id)) {
    selectedItems.push(id);
    allItems = allItems.filter((x) => x !== id);
  }
  res.json({ ok: true });
});

// Убрать из выбранных
app.post("/unselect", (req, res) => {
  const { id } = req.body;
  if (selectedItems.includes(id)) {
    selectedItems = selectedItems.filter((x) => x !== id);
    allItems.push(id);
  }
  res.json({ ok: true });
});

// Добавить новый элемент
app.post("/add", (req, res) => {
  const { id } = req.body;
  addQueue.add(id);
  res.json({ ok: true });
});

// Перестановка выбранных элементов
app.post("/reorder", (req, res) => {
  const { items } = req.body;
  selectedItems = items;
  res.json({ ok: true });
});

// Раздача фронтенда
app.use(express.static(path.join(__dirname, "frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
