import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const PAGE_SIZE = 20;

export default function App() {
  const [allItems, setAllItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const allPage = useRef(0);
  const selectedPage = useRef(0);
  const allEnd = useRef(false);
  const selectedEnd = useRef(false);

  const fetchAll = async () => {
    if (allEnd.current) return;
    const res = await axios.get(
      `http://localhost:4000/items?start=${allPage.current * PAGE_SIZE}&limit=${PAGE_SIZE}&filter=${filter}`
    );
    if (res.data.length < PAGE_SIZE) allEnd.current = true;
    setAllItems((prev) => [...prev, ...res.data]);
    allPage.current++;
  };

  const fetchSelected = async () => {
    if (selectedEnd.current) return;
    const res = await axios.get(
      `http://localhost:4000/selected?start=${selectedPage.current * PAGE_SIZE}&limit=${PAGE_SIZE}&filter=${selectedFilter}`
    );
    if (res.data.length < PAGE_SIZE) selectedEnd.current = true;
    setSelectedItems((prev) => [...prev, ...res.data]);
    selectedPage.current++;
  };

  useEffect(() => {
    allPage.current = 0;
    allEnd.current = false;
    setAllItems([]);
    fetchAll();
  }, [filter]);

  useEffect(() => {
    selectedPage.current = 0;
    selectedEnd.current = false;
    setSelectedItems([]);
    fetchSelected();
  }, [selectedFilter]);

  const selectItem = async (item) => {
    await axios.post("http://localhost:4000/select", { id: item.id });
    setAllItems((prev) => prev.filter((i) => i.id !== item.id));
    setSelectedItems((prev) => [item, ...prev]);
  };

  const unselectItem = async (item) => {
    await axios.post("http://localhost:4000/unselect", { id: item.id });
    setSelectedItems((prev) => prev.filter((i) => i.id !== item.id));
    setAllItems((prev) => [item, ...prev]);
  };

  const addItem = async () => {
    const id = parseInt(prompt("Введите ID нового элемента:"), 10);
    if (!isNaN(id)) {
      await axios.post("http://localhost:4000/add", { id });
      setAllItems((prev) => [{ id }, ...prev]);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(selectedItems);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setSelectedItems(items);
    await axios.post("http://localhost:4000/reorder", { ids: items.map((i) => i.id) });
  };

  const handleScroll = (e, fetchFn) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 50) fetchFn();
  };

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      <div
        style={{ flex: 1, border: "1px solid #ccc", padding: "10px", maxHeight: "80vh", overflowY: "auto" }}
        onScroll={(e) => handleScroll(e, fetchAll)}
      >
        <h3>Все элементы</h3>
        <input placeholder="Фильтр" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <button onClick={addItem}>Добавить элемент</button>
        {allItems.map((item) => (
          <div
            key={item.id}
            style={{ border: "1px solid #999", margin: "5px 0", padding: "5px", cursor: "pointer" }}
            onClick={() => selectItem(item)}
          >
            {item.id}
          </div>
        ))}
      </div>

      <div
        style={{ flex: 1, border: "1px solid #ccc", padding: "10px", maxHeight: "80vh", overflowY: "auto" }}
        onScroll={(e) => handleScroll(e, fetchSelected)}
      >
        <h3>Выбранные элементы</h3>
        <input placeholder="Фильтр" value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} />
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="selected">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {selectedItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                    {(prov) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        style={{ border: "1px solid #999", margin: "5px 0", padding: "5px", cursor: "grab", ...prov.draggableProps.style }}
                        onClick={() => unselectItem(item)}
                      >
                        {item.id}
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
