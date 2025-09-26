import React, { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const API = "http://localhost:4000";

function App() {
  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [newId, setNewId] = useState("");

  // Загрузка элементов с сервера
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resItems = await axios.get(`${API}/api/items`);
        const resSelected = await axios.get(`${API}/api/selected`);
        setAllItems(resItems.data);
        setSelected(resSelected.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Левый список после фильтра и удаления выбранных
  useEffect(() => {
    const filtered = allItems
      .filter(item => !selected.find(sel => sel.id === item.id))
      .filter(item => item.id.toString().includes(filter))
      .sort((a, b) => a.id - b.id);
    setItems(filtered);
  }, [allItems, selected, filter]);

  // Правый список фильтрованный
  const filteredSelected = selected
    .filter(item => item.id.toString().includes(selectedFilter))
    .sort((a, b) => a.id - b.id);

  // Выбор элемента
  const selectItem = async (item) => {
    try {
      await axios.post(`${API}/api/select`, { id: item.id });
      setSelected(prev => [...prev, item]);
    } catch (err) {
      console.error(err);
    }
  };

  // Удаление из выбранных
  const unselectItem = async (item) => {
    try {
      await axios.post(`${API}/api/unselect`, { id: item.id });
      setSelected(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      console.error(err);
    }
  };

  // Добавление нового элемента
  const addNewItem = async () => {
    const id = parseInt(newId);
    if (!id || allItems.find(i => i.id === id)) return;
    const newItem = { id };
    try {
      await axios.post(`${API}/api/add`, newItem);
      setAllItems(prev => [...prev, newItem]);
      setNewId("");
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and drop для выбранных
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(selected);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setSelected(reordered);
  };

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      {/* Левый список */}
      <div style={{ flex: 1, border: "1px solid #ccc", padding: "10px", height: "80vh", overflowY: "auto" }}>
        <input
          placeholder="Фильтр ID"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        {items.map(item => (
          <div
            key={item.id}
            style={{ padding: "5px", border: "1px solid #aaa", margin: "5px 0", cursor: "pointer" }}
            onClick={() => selectItem(item)}
          >
            ID: {item.id}
          </div>
        ))}
        <div style={{ marginTop: "10px" }}>
          <input
            type="number"
            placeholder="Новый ID"
            value={newId}
            onChange={e => setNewId(e.target.value)}
          />
          <button onClick={addNewItem}>Добавить</button>
        </div>
      </div>

      {/* Правый список */}
      <div style={{ flex: 1, border: "1px solid #ccc", padding: "10px", height: "80vh", overflowY: "auto" }}>
        <input
          placeholder="Фильтр выбранных"
          value={selectedFilter}
          onChange={e => setSelectedFilter(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="selected">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {filteredSelected.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                    {(prov) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        style={{
                          padding: "5px",
                          border: "1px solid #aaa",
                          margin: "5px 0",
                          cursor: "grab",
                          ...prov.draggableProps.style
                        }}
                        onClick={() => unselectItem(item)}
                      >
                        ID: {item.id}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

export default App;
