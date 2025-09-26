import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

let allItems = [];
let selectedItems = [];

// Инициализация миллионом элементов
if (allItems.length === 0) {
  for (let i = 1; i <= 1000000; i++) {
    allItems.push({ id: i });
  }
}

// Получить все элементы
app.get("/api/items", (req, res) => {
  res.json(allItems);
});

// Получить выбранные элементы
app.get("/api/selected", (req, res) => {
  res.json(selectedItems);
});

// Выбрать элемент
app.post("/api/select", (req, res) => {
  const { id } = req.body;
  const item = allItems.find(i => i.id === id);
  if (item && !selectedItems.find(i => i.id === id)) {
    selectedItems.push(item);
  }
  res.json(selectedItems);
});

// Убрать элемент из выбранных
app.post("/api/unselect", (req, res) => {
  const { id } = req.body;
  selectedItems = selectedItems.filter(i => i.id !== id);
  res.json(selectedItems);
});

// Добавить новый элемент
app.post("/api/add", (req, res) => {
  const { id } = req.body;
  if (!allItems.find(i => i.id === id)) {
    const newItem = { id };
    allItems.push(newItem);
    res.json(newItem);
  } else {
    res.status(400).json({ error: "ID уже существует" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
