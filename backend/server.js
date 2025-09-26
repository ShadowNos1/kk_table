import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 4000; // фиксированный порт

// для работы с __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
app.use(cors());
app.use(bodyParser.json());

// простая in-memory база для примера
let items = Array.from({ length: 100000 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));
let selected = [];

// отдаём фронтенд-статик
const frontendBuildPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendBuildPath));

// API: получить все элементы (с фильтром)
app.get("/api/items", (req, res) => {
  const filter = req.query.filter ? req.query.filter.toLowerCase() : "";

  const filteredItems = items
    .filter(item => !selected.find(s => s.id === item.id))
    .filter(item => item.name.toLowerCase().includes(filter));

  res.json(filteredItems);
});

// API: получить выбранные элементы
app.get("/api/selected", (req, res) => {
  res.json(selected);
});

// API: выбрать элемент
app.post("/api/select", (req, res) => {
  const { id } = req.body;
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    const [item] = items.splice(index, 1);
    selected.push(item);
    res.json({ success: true, item });
  } else {
    res.status(404).json({ success: false, message: "Item not found" });
  }
});

// API: удалить выбранный элемент
app.post("/api/unselect", (req, res) => {
  const { id } = req.body;
  const index = selected.findIndex(item => item.id === id);
  if (index !== -1) {
    const [item] = selected.splice(index, 1);
    items.push(item);
    items.sort((a, b) => a.id - b.id); // вернуть порядок
    res.json({ success: true, item });
  } else {
    res.status(404).json({ success: false, message: "Selected item not found" });
  }
});

// любые другие запросы возвращают index.html фронтенда
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
