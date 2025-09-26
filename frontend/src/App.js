import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const API_BASE = process.env.REACT_APP_API_URL || "";

function App() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const [selOffset, setSelOffset] = useState(0);
  const [newId, setNewId] = useState("");
  const LIMIT = 20;

  const leftRef = useRef();
  const rightRef = useRef();

  const loadItems = async () => {
    const res = await axios.get(`${API_BASE}/api/items`, { params: { offset, limit: LIMIT, filter } });
    setItems(prev => [...prev, ...res.data]);
    setOffset(prev => prev + res.data.length);
  };

  const loadSelected = async () => {
    const res = await axios.get(`${API_BASE}/api/selected`, { params: { offset: selOffset, limit: LIMIT, filter: selectedFilter } });
    setSelected(prev => [...prev, ...res.data]);
    setSelOffset(prev => prev + res.data.length);
  };

  useEffect(() => {
    setItems([]);
    setOffset(0);
    loadItems();
  }, [filter]);

  useEffect(() => {
    setSelected([]);
    setSelOffset(0);
    loadSelected();
  }, [selectedFilter]);

  // скролл для подгрузки
  const handleScroll = (ref, loadFunc) => {
    if (!ref.current) return;
    const { scrollTop, scrollHeight, clientHeight } = ref.current;
    if (scrollTop + clientHeight >= scrollHeight - 5) loadFunc();
  };

  const selectItem = async (item) => {
    await axios.post(`${API_BASE}/api/select`, { id: item.id });
    setItems(prev => prev.filter(i => i.id !== item.id));
    setSelected(prev => [item, ...prev]);
  };

  const unselectItem = async (item) => {
    await axios.post(`${API_BASE}/api/unselect`, { id: item.id });
    setSelected(prev => prev.filter(i => i.id !== item.id));
    setItems(prev => [item, ...prev]);
  };

  const addItem = async () => {
    if (!newId) return;
    const idNum = parseInt(newId);
    if (isNaN(idNum)) return alert("Введите число");
    await axios.post(`${API_BASE}/api/add`, { id: idNum });
    setItems(prev => [{ id: idNum }, ...prev]);
    setNewId("");
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(selected);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setSelected(reordered);
    await axios.post(`${API_BASE}/api/reorder`, { selected: reordered.map(i => i.id) });
  };

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      {/* Левый */}
      <div 
        style={{ flex: 1, border: "1px solid #ccc", padding: "10px", height: "80vh", overflow: "auto" }}
        ref={leftRef}
        onScroll={() => handleScroll(leftRef, loadItems)}
      >
        <h3>Все элементы</h3>
        <input placeholder="Фильтр" value={filter} onChange={e => setFilter(e.target.value)} />
        <div>
          <input placeholder="Добавить ID" value={newId} onChange={e => setNewId(e.target.value)} />
          <button onClick={addItem}>Добавить</button>
        </div>
        {items.map(item => (
          <div key={item.id} style={{ padding: "5px", borderBottom: "1px solid #eee", cursor: "pointer" }}
               onClick={() => selectItem(item)}>
            ID: {item.id}
          </div>
        ))}
      </div>

      {/* Правый */}
      <div 
        style={{ flex: 1, border: "1px solid #ccc", padding: "10px", height: "80vh", overflow: "auto" }}
        ref={rightRef}
        onScroll={() => handleScroll(rightRef, loadSelected)}
      >
        <h3>Выбранные</h3>
        <input placeholder="Фильтр" value={selectedFilter} onChange={e => setSelectedFilter(e.target.value)} />
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="selected">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {selected.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                    {(prov) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        style={{ padding: "5px", borderBottom: "1px solid #eee", cursor: "pointer", ...prov.draggableProps.style }}
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
