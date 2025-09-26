import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 4000;

// Для __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(bodyParser.json());

// Пусть сборка React лежит в frontend/build
app.use(express.static(path.join(__dirname, "frontend", "build")));

// Пример in-memory хранилища
let allItems = Array.from({ length: 1000 }, (_, i) => ({ id: i + 1 }));
let selectedItems = [];

// API для фронтенда
app.get("/api/items", (req, res) => {
  const { filter } = req.query;
  let items = allItems.filter((i) => !selectedItems.find((s) => s.id === i.id));
  if (filter) items = items.filter((i) => i.id.toString().includes(filter));
  res.json(items);
});

app.get("/api/selected", (req, res) => {
  const { filter } = req.query;
  let items = selectedItems;
  if (filter) items = items.filter((i) => i.id.toString().includes(filter));
  res.json(items);
});

app.post("/api/select", (req, res) => {
  const { id } = req.body;
  const index = allItems.findIndex((i) => i.id === id);
  if (index > -1) {
    const [item] = allItems.splice(index, 1);
    selectedItems.push(item);
  }
  res.json(selectedItems);
});

app.post("/api/unselect", (req, res) => {
  const { id } = req.body;
  const index = selectedItems.findIndex((i) => i.id === id);
  if (index > -1) {
    const [item] = selectedItems.splice(index, 1);
    allItems.push(item);
    allItems.sort((a, b) => a.id - b.id); // держим порядок
  }
  res.json(selectedItems);
});

// Любой другой маршрут отдаёт index.html (для React Router)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
