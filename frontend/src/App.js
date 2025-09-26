import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const PAGE_SIZE = 20;
const API_BASE = process.env.REACT_APP_API_URL || "";

export default function App() {
  const [allItems, setAllItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [allOffset, setAllOffset] = useState(0);
  const [selectedOffset, setSelectedOffset] = useState(0);
  const loaderAll = useRef(false);
  const loaderSelected = useRef(false);

  const fetchItems = async (reset = false) => {
    if (loaderAll.current) return;
    loaderAll.current = true;
    const offset = reset ? 0 : allOffset;
    try {
      const res = await axios.get(`${API_BASE}/api/items`, {
        params: { filter, offset, limit: PAGE_SIZE },
      });
      setAllItems((prev) => (reset ? res.data : [...prev, ...res.data]));
      setAllOffset(reset ? PAGE_SIZE : allOffset + PAGE_SIZE);
    } catch (err) {
      console.error(err);
    } finally {
      loaderAll.current = false;
    }
  };

  const fetchSelected = async (reset = false) => {
    if (loaderSelected.current) return;
    loaderSelected.current = true;
    const offset = reset ? 0 : selectedOffset;
    try {
      const res = await axios.get(`${API_BASE}/api/selected`, {
        params: { filter: selectedFilter, offset, limit: PAGE_SIZE },
      });
      setSelectedItems((prev) => (reset ? res.data : [...prev, ...res.data]));
      setSelectedOffset(reset ? PAGE_SIZE : selectedOffset + PAGE_SIZE);
    } catch (err) {
      console.error(err);
    } finally {
      loaderSelected.current = false;
    }
  };

  useEffect(() => { fetchItems(true); }, [filter]);
  useEffect(() => { fetchSelected(true); }, [selectedFilter]);

  const handleSelect = async (id) => {
    try {
      await axios.post(`${API_BASE}/api/select`, { id });
      setAllItems(allItems.filter((i) => i !== id));
      setSelectedItems([id, ...selectedItems]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnselect = async (id) => {
    try {
      await axios.post(`${API_BASE}/api/unselect`, { id });
      setSelectedItems(selectedItems.filter((i) => i !== id));
      setAllItems([id, ...allItems]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async () => {
    const id = parseInt(prompt("Введите ID нового элемента:"));
    if (!id) return;
    try {
      await axios.post(`${API_BASE}/api/add`, { id });
      setAllItems([id, ...allItems]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setFilter("");
    fetchItems(true);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(selectedItems);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setSelectedItems(items);
  };

  const handleScrollAll = (e) => {
    if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 5) {
      fetchItems();
    }
  };

  const handleScrollSelected = (e) => {
    if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 5) {
      fetchSelected();
    }
  };

  return (
    <div style={{ display: "flex", gap: 20, padding: 20 }}>
      <div style={{ flex: 1 }}>
        <h3>Все элементы</h3>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <input
            placeholder="Фильтр"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <button onClick={handleAdd}>Добавить</button>
          <button onClick={handleReset}>Сбросить список</button>
        </div>
        <div
          style={{ height: "500px", overflow: "auto", border: "1px solid black" }}
          onScroll={handleScrollAll}
        >
          {allItems.map((id) => (
            <div
              key={id}
              style={{ padding: 10, borderBottom: "1px solid #ccc", cursor: "pointer" }}
              onClick={() => handleSelect(id)}
            >
              {id}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h3>Выбранные элементы</h3>
        <input
          placeholder="Фильтр"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        />
        <div
          style={{ height: "500px", overflow: "auto", border: "1px solid black", marginTop: 10 }}
          onScroll={handleScrollSelected}
        >
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="selected">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {selectedItems.map((id, index) => (
                    <Draggable key={id} draggableId={id.toString()} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            padding: 10,
                            borderBottom: "1px solid #ccc",
                            cursor: "pointer",
                            ...provided.draggableProps.style,
                          }}
                          onClick={() => handleUnselect(id)}
                        >
                          {id}
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
    </div>
  );
}
