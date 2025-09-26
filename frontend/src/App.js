import React, { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const API = "http://localhost:4000";

function App() {
  const [allItems, setAllItems] = useState([]);        // все элементы
  const [items, setItems] = useState([]);              // отображаемые в левом окне
  const [allSelected, setAllSelected] = useState([]);  // все выбранные
  const [selected, setSelected] = useState([]);        // отображаемые в правом окне
  const [filter, setFilter] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [newId, setNewId] = useState("");

  // Загрузка всех элементов
  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`${API}/api/items`);
      const resSelected = await axios.get(`${API}/api/selected`);
      setAllItems(res.data);
      setItems(res.data);
      setAllSelected(resSelected.data);
      setSelected(resSelected.data);
    };
    fetchData();
  }, []);

  // Фильтр левого окна
  useEffect(() => {
    const filtered = allItems
      .filter(item => !allSelected.some(sel => sel.id === item.id))
      .filter(item => item.id.toString().includes(filter))
      .sort((a, b) => a.id - b.id);
    setItems(filtered);
  }, [filter, allItems, allSelected]);

  // Фильтр правого окна
  useEffect(() => {
    const filtered = allSelected
      .filter(item => item.id.toString().includes(selectedFilter))
      .sort((a, b) => a.id - b.id);
    setSelected(filtered);
  }, [selectedFilter, allSelected]);

  const selectItem = async (item) => {
    await axios.post(`${API}/api/select`, { id: item.id });
    setAllSelected(prev => [...prev, item]);
  };

  const unselectItem = async (item) => {
    await axios.post(`${API}/api/unselect`, { id: item.id });
    setAllSelected(prev => prev.filter(i => i.id !== item.id));
  };

  const addNewItem = async () => {
    const id = parseInt(newId);
    if (!id || allItems.some(i => i.id === id)) return;
    const newItem = { id };
    await axios.post(`${API}/api/add`, newItem);
    setAllItems(prev => [...prev, newItem]);
    setNewId("");
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newSelected = Array.from(allSelected);
    const [moved] = newSelected.splice(result.source.index, 1);
    newSelected.splice(result.destination.index, 0, moved);
    setAllSelected(newSelected);
  };

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      {/* Левое окно */}
      <div style={{ flex: 1, border: "1px solid #ccc", padding: "10px", height: "80vh", overflowY: "auto" }}>
        <input
          type="text"
          placeholder="Фильтр ID"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <div>
          {items.map(item => (
            <div
              key={item.id}
              style={{ padding: "5px", border: "1px solid #aaa", margin: "5px 0", cursor: "pointer" }}
              onClick={() => selectItem(item)}
            >
              ID: {item.id}
            </div>
          ))}
        </div>
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

      {/* Правое окно */}
      <div style={{ flex: 1, border: "1px solid #ccc", padding: "10px", height: "80vh", overflowY: "auto" }}>
        <input
          type="text"
          placeholder="Фильтр выбранных"
          value={selectedFilter}
          onChange={e => setSelectedFilter(e.target.value)}
        />
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="selected">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {selected.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          padding: "5px",
                          border: "1px solid #aaa",
                          margin: "5px 0",
                          cursor: "grab",
                          ...provided.draggableProps.style
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
