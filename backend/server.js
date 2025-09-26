import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

const TOTAL_ITEMS = 1_000_000; // миллион элементов
let selectedItems = []; // массив выбранных id

// функция для генерации элемента по id
const createItem = (id) => ({ id });

// Получение всех элементов с фильтром и пагинацией
app.get("/api/items", (req, res) => {
  const filter = req.query.filter || "";
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 20;

  let items = [];
  let count = 0;
  let id = 1;

  // формируем только нужный диапазон с учётом фильтра
  while (items.length < limit && id <= TOTAL_ITEMS) {
    if (!selectedItems.includes(id) && id.toString().includes(filter)) {
      if (count >= offset) items.push(createItem(id));
      count++;
    }
    id++;
  }

  res.json(items);
});

// Получение выбранных элементов
app.get("/api/selected", (req, res) => {
  const filter = req.query.filter || "";
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 20;

  const filtered = selectedItems
    .filter((id) => id.toString().includes(filter))
    .slice(offset, offset + limit)
    .map(createItem);

  res.json(filtered);
});

// Выбор элемента
app.post("/api/select", (req, res) => {
  const { id } = req.body;
  if (!selectedItems.includes(id)) selectedItems.push(id);
  res.json({ success: true });
});

// Убрать элемент из выбранных
app.post("/api/unselect", (req, res) => {
  const { id } = req.body;
  selectedItems = selectedItems.filter((i) => i !== id);
  res.json({ success: true });
});

// Добавление нового элемента
app.post("/api/add", (req, res) => {
  const { id } = req.body;
  // новый элемент не добавляем в selected
  // ничего не делаем, т.к. все элементы вычисляются виртуально
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
