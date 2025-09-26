import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Данные в памяти
let allItems = [];
for (let i = 1; i <= 100; i++) {
  allItems.push(i);
}

let selectedItems = [];

// Корень просто для проверки
app.get("/", (req, res) => {
  res.send("API running");
});

// Получить все элементы (не выбранные)
app.get("/api/items", (req, res) => {
  const { filter } = req.query;
  let filtered = allItems.filter((id) => !selectedItems.includes(id));
  if (filter) {
    filtered = filtered.filter((id) => id.toString().includes(filter));
  }
  res.json(filtered);
});

// Получить выбранные элементы
app.get("/api/selected", (req, res) => {
  const { filter } = req.query;
  let filtered = selectedItems.slice();
  if (filter) {
    filtered = filtered.filter((id) => id.toString().includes(filter));
  }
  res.json(filtered);
});

// Выбрать элемент
app.post("/api/select", (req, res) => {
  const { id } = req.body;
  const numId = Number(id);
  if (!selectedItems.includes(numId) && allItems.includes(numId)) {
    selectedItems.push(numId);
  }
  res.json({ success: true });
});

// Убрать элемент из выбранных
app.post("/api/unselect", (req, res) => {
  const { id } = req.body;
  const numId = Number(id);
  selectedItems = selectedItems.filter((i) => i !== numId);
  res.json({ success: true });
});

// Добавить новый элемент
app.post("/api/add", (req, res) => {
  const { id } = req.body;
  const numId = Number(id);
  if (!allItems.includes(numId) && !selectedItems.includes(numId)) {
    allItems.push(numId);
  }
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
