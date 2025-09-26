import React, { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const API_URL = "http://localhost:4000/api";

function App() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("");

  // Загрузка всех элементов и выбранных
  const loadItems = async () => {
    try {
      const itemsRes = await axios.get(`${API_URL}/items`, { params: { filter } });
      const selectedRes = await axios.get(`${API_URL}/selected`);
      setItems(itemsRes.data);
      setSelected(selectedRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadItems();
  }, [filter]);

  const handleSelect = async (itemId) => {
    try {
      await axios.post(`${API_URL}/select`, { id: itemId });
      loadItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnselect = async (itemId) => {
    try {
      await axios.post(`${API_URL}/unselect`, { id: itemId });
      loadItems();
    } catch (err) {
      console.error(err);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId) return;

    // перетаскивание слева направо
    if (source.droppableId === "items" && destination.droppableId === "selected") {
      handleSelect(items[source.index].id);
    }

    // перетаскивание справа налево
    if (source.droppableId === "selected" && destination.droppableId === "items") {
      handleUnselect(selected[source.index].id);
    }
  };

  return (
    <div style={{ display: "flex", padding: 20, gap: 20 }}>
      <input
        type="text"
        placeholder="Фильтр..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ position: "absolute", top: 10, left: 10, width: 200, padding: 5 }}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="items">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ width: 250, minHeight: 400, border: "1px solid #ccc", padding: 10 }}
            >
              <h3>Все элементы</h3>
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={`${item.id}`} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        padding: 10,
                        margin: "5px 0",
                        background: "#f2f2f2",
                        borderRadius: 4,
                        ...provided.draggableProps.style,
                      }}
                      onClick={() => handleSelect(item.id)}
                    >
                      {item.name}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <Droppable droppableId="selected">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ width: 250, minHeight: 400, border: "1px solid #ccc", padding: 10 }}
            >
              <h3>Выбранные</h3>
              {selected.map((item, index) => (
                <Draggable key={item.id} draggableId={`selected-${item.id}`} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        padding: 10,
                        margin: "5px 0",
                        background: "#d2f0d2",
                        borderRadius: 4,
                        ...provided.draggableProps.style,
                      }}
                      onClick={() => handleUnselect(item.id)}
                    >
                      {item.name}
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
  );
}

export default App;
