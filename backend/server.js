import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ==== ДАННЫЕ В ПАМЯТИ ====
let allItems = Array.from({ length: 1000000 }, (_, i) => ({ id: i + 1 }));
let selectedItems = [];
let addQueue = [];

// ==== ПОМОЩНИКИ ====
function dedupeQueue(queue) {
  return [...new Set(queue.map(item => item.id))].map(id => queue.find(i => i.id === id));
}

// ==== API ====

// Получить элементы с фильтром и пагинацией
app.get("/api/items", (req, res) => {
  let { offset = 0, limit = 20, filter = "" } = req.query;
  offset = parseInt(offset);
  limit = parseInt(limit);

  let filtered = allItems.filter(item => !selectedItems.find(s => s.id === item.id));
  if (filter) filtered = filtered.filter(item => item.id.toString().includes(filter));

  res.json(filtered.slice(offset, offset + limit));
});

// Получить выбранные элементы
app.get("/api/selected", (req, res) => {
  let { offset = 0, limit = 20, filter = "" } = req.query;
  offset = parseInt(offset);
  limit = parseInt(limit);

  let filtered = selectedItems;
  if (filter) filtered = filtered.filter(item => item.id.toString().includes(filter));

  res.json(filtered.slice(offset, offset + limit));
});

// Добавить новые элементы в очередь
app.post("/api/items/add", (req, res) => {
  const { items } = req.body; // [{id: 1000001}, ...]
  if (items && Array.isArray(items)) {
    addQueue.push(...items);
    addQueue = dedupeQueue(addQueue);
    res.json({ status: "queued" });
  } else {
    res.status(400).json({ error: "Invalid payload" });
  }
});

// Выбрать элемент
app.post("/api/select", (req, res) => {
  const { id } = req.body;
  const index = allItems.findIndex(i => i.id === id);
  if (index !== -1 && !selectedItems.find(s => s.id === id)) {
    const item = allItems.splice(index, 1)[0];
    selectedItems.push(item);
    res.json({ status: "ok" });
  } else {
    res.status(400).json({ error: "Item not found or already selected" });
  }
});

// Убрать элемент из выбранных
app.post("/api/unselect", (req, res) => {
  const { id } = req.body;
  const index = selectedItems.findIndex(i => i.id === id);
  if (index !== -1) {
    const item = selectedItems.splice(index, 1)[0];
    allItems.push(item); // возвращаем обратно
    allItems.sort((a, b) => a.id - b.id);
    res.json({ status: "ok" });
  } else {
    res.status(400).json({ error: "Item not found" });
  }
});

// Батч добавления новых элементов раз в 10 секунд
setInterval(() => {
  if (addQueue.length > 0) {
    allItems.push(...addQueue);
    allItems.sort((a, b) => a.id - b.id);
    addQueue = [];
  }
}, 10000);

// ==== Обслуживание фронтенда ====
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ==== СТАРТ СЕРВЕРА ====
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
