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

let items = Array.from({ length: 1000000 }, (_, i) => ({ id: i + 1 }));
let selected = [];

app.get("/items", (req, res) => {
  let { offset = 0, limit = 20, search = "" } = req.query;
  offset = parseInt(offset); limit = parseInt(limit);
  let filtered = items;
  if (search) filtered = filtered.filter(el => el.id.toString().includes(search));
  filtered.sort((a, b) => a.id - b.id);
  res.json(filtered.slice(offset, offset + limit));
});

app.get("/selected", (req, res) => res.json(selected));

app.post("/select", (req, res) => {
  const { id } = req.body;
  const index = items.findIndex(el => el.id === id);
  if (index !== -1) {
    selected.push(items[index]);
    items.splice(index, 1);
  }
  res.sendStatus(200);
});

app.post("/unselect", (req, res) => {
  const { id } = req.body;
  const index = selected.findIndex(el => el.id === id);
  if (index !== -1) {
    const item = selected[index];
    selected.splice(index, 1);
    const insertIndex = items.findIndex(el => el.id > id);
    if (insertIndex === -1) items.push(item);
    else items.splice(insertIndex, 0, item);
  }
  res.sendStatus(200);
});

app.post("/reorder", (req, res) => {
  const { ids } = req.body;
  selected = ids.map(id => selected.find(el => el.id === id)).filter(Boolean);
  res.sendStatus(200);
});

app.post("/add", (req, res) => {
  const { id } = req.body;
  if (items.some(el => el.id === id) || selected.some(el => el.id === id))
    return res.status(400).json({ message: "Элемент с таким ID уже существует" });
  const newItem = { id };
  const insertIndex = items.findIndex(el => el.id > id);
  if (insertIndex === -1) items.push(newItem);
  else items.splice(insertIndex, 0, newItem);
  res.json(newItem);
});

// Раздача фронтенда
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
