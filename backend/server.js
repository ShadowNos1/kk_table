const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======= Имитируем миллион элементов =======
const TOTAL_ITEMS = 1000000;
let selectedSet = new Set(); // для выбранных элементов

// Получение всех элементов с фильтром и пагинацией
app.get("/api/items", (req, res) => {
  let { filter = "", offset = 0, limit = 20 } = req.query;
  offset = parseInt(offset);
  limit = parseInt(limit);

  const items = [];
  let count = 0;
  let id = 1 + offset;

  while (items.length < limit && id <= TOTAL_ITEMS) {
    if (!selectedSet.has(id) && id.toString().includes(filter)) {
      items.push(id);
    }
    id++;
    count++;
    if (count > TOTAL_ITEMS) break; // защита от бесконечного цикла
  }

  res.json(items);
});

// Получение выбранных элементов с фильтром
app.get("/api/selected", (req, res) => {
  let { filter = "", offset = 0, limit = 20 } = req.query;
  offset = parseInt(offset);
  limit = parseInt(limit);

  const selectedArray = Array.from(selectedSet)
    .filter((id) => id.toString().includes(filter))
    .slice(offset, offset + limit);

  res.json(selectedArray);
});

// Выбрать элемент
app.post("/api/select", (req, res) => {
  const { id } = req.body;
  const num = parseInt(id);
  if (!isNaN(num)) selectedSet.add(num);
  res.json({ ok: true });
});

// Убрать из выбранных
app.post("/api/unselect", (req, res) => {
  const { id } = req.body;
  const num = parseInt(id);
  if (!isNaN(num)) selectedSet.delete(num);
  res.json({ ok: true });
});

// Добавить новый элемент
app.post("/api/add", (req, res) => {
  const { id } = req.body;
  const num = parseInt(id);
  if (!isNaN(num)) TOTAL_ITEMS++; // увеличиваем общее количество элементов
  res.json({ ok: true });
});

// ======= Отдача фронтенда React =======
const frontendBuildPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

// ======= Запуск сервера =======
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
