import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(bodyParser.json());

// "База данных" в памяти
let allItems = Array.from({ length: 1000 }, (_, i) => i + 1);
let selectedItems = [];

// API для всех элементов
app.get("/api/items", (req, res) => {
  const { filter = "", offset = 0, limit = 20 } = req.query;
  const data = allItems
    .filter((i) => i.toString().includes(filter))
    .slice(Number(offset), Number(offset) + Number(limit));
  res.json(data);
});

// API для выбранных элементов
app.get("/api/selected", (req, res) => {
  const { filter = "", offset = 0, limit = 20 } = req.query;
  const data = selectedItems
    .filter((i) => i.toString().includes(filter))
    .slice(Number(offset), Number(offset) + Number(limit));
  res.json(data);
});

// Выбор элемента
app.post("/api/select", (req, res) => {
  const { id } = req.body;
  const index = allItems.indexOf(id);
  if (index !== -1) {
    allItems.splice(index, 1);
    selectedItems.unshift(id);
  }
  res.json({ success: true });
});

// Снятие выбора
app.post("/api/unselect", (req, res) => {
  const { id } = req.body;
  const index = selectedItems.indexOf(id);
  if (index !== -1) {
    selectedItems.splice(index, 1);
    allItems.unshift(id);
  }
  res.json({ success: true });
});

// Добавление элемента
app.post("/api/add", (req, res) => {
  const { id } = req.body;
  if (!allItems.includes(id) && !selectedItems.includes(id)) {
    allItems.unshift(id);
  }
  res.json({ success: true });
});

// Отдаём фронтенд
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT);
