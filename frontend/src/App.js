import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const API = "http://localhost:4000";

function App() {
  const [allItems, setAllItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [allFilter, setAllFilter] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const allStart = useRef(0);
  const selectedStart = useRef(0);
  const limit = 20;

  const loadAll = async () => {
    const res = await axios.get(`${API}/items`, {
      params: { start: allStart.current, limit, filter: allFilter },
    });
    setAllItems((prev) => [...prev, ...res.data]);
    allStart.current += res.data.length;
  };

  const loadSelected = async () => {
    const res = await axios.get(`${API}/selected`, {
      params: { start: selectedStart.current, limit, filter: selectedFilter },
    });
    setSelectedItems((prev) => [...prev, ...res.data]);
    selectedStart.current += res.data.length;
  };

  useEffect(() => {
    allStart.current = 0;
    setAllItems([]);
    loadAll();
  }, [allFilter]);

  useEffect(() => {
    selectedStart.current = 0;
    setSelectedItems([]);
    loadSelected();
  }, [selectedFilter]);

  const selectItem = async (id) => {
    await axios.post(`${API}/select`, { id });
    setAllItems((prev) => prev.filter((x) => x !== id));
    setSelectedItems((prev) => [...prev, id]);
  };

  const unselectItem = async (id) => {
    await axios.post(`${API}/unselect`, { id });
    setSelectedItems((prev) => prev.filter((x) => x !== id));
    setAllItems((prev) => [...prev, id]);
  };

  const addItem = async (id) => {
    await axios.post(`${API}/add`, { id: parseInt(id) });
    setAllItems((prev) => [...prev, parseInt(id)]);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(selectedItems);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    setSelectedItems(items);
    await axios.post(`${API}/reorder`, { items });
  };

  const handleScroll = (e, listType) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) listType === "all" ? loadAll() : loadSelected();
  };

  return (
    <div style={{ display: "flex", gap: 20, padding: 20 }}>
      <div
        style={{ flex: 1, height: "90vh", overflowY: "auto" }}
        onScroll={(e) => handleScroll(e, "all")}
      >
        <input
          placeholder="Фильтр по ID"
          value={allFilter}
          onChange={(e) => setAllFilter(e.target.value)}
        />
        {allItems.sort((a, b) => a - b).map((id) => (
          <div
            key={id}
            onClick={() => selectItem(id)}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              margin: 5,
              cursor: "pointer",
            }}
          >
            {id}
          </div>
        ))}
        <div>
          <input type="number" id="newId" placeholder="Новый ID" />
          <button onClick={() => addItem(document.getElementById("newId").value)}>
            Добавить
          </button>
        </div>
      </div>

      <div
        style={{ flex: 1, height: "90vh", overflowY: "auto" }}
        onScroll={(e) => handleScroll(e, "selected")}
      >
        <input
          placeholder="Фильтр выбранных"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        />
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="selected">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {selectedItems.map((id, index) => (
                  <Draggable key={id} draggableId={id.toString()} index={index}>
                    {(prov) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        onClick={() => unselectItem(id)}
                        style={{
                          border: "1px solid #ccc",
                          padding: 10,
                          margin: 5,
                          cursor: "pointer",
                          ...prov.draggableProps.style,
                        }}
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
  );
}

export default App;
