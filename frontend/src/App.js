import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

const API = "http://localhost:4000";

function App() {
  const [allItems, setAllItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [offsetAll, setOffsetAll] = useState(0);
  const [hasMoreAll, setHasMoreAll] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [searchAll, setSearchAll] = useState("");
  const [searchSelected, setSearchSelected] = useState("");
  const [newId, setNewId] = useState("");
  const loaderAll = useRef(null);

  useEffect(() => {
    loadAllItems(true, searchAll);
    loadSelectedItems();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreAll && !loadingAll) {
          loadAllItems(false, searchAll);
        }
      },
      { threshold: 1 }
    );
    if (loaderAll.current) observer.observe(loaderAll.current);
    return () => observer.disconnect();
  }, [loaderAll.current, hasMoreAll, searchAll, loadingAll]);

  const loadAllItems = async (reset = false, search = "") => {
    if (loadingAll) return;
    setLoadingAll(true);
    try {
      const res = await axios.get(`${API}/items`, {
        params: { offset: reset ? 0 : offsetAll, limit: 20, search }
      });
      const existingIds = new Set([...selectedItems.map(i => i.id), ...allItems.map(i => i.id)]);
      const newItems = res.data.filter(i => !existingIds.has(i.id));
      const combined = reset ? newItems : [...allItems, ...newItems];
      combined.sort((a, b) => a.id - b.id);
      setAllItems(combined);
      setOffsetAll(reset ? 20 : offsetAll + 20);
      setHasMoreAll(res.data.length === 20);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAll(false);
    }
  };

  const loadSelectedItems = async () => {
    const res = await axios.get(`${API}/selected`);
    setSelectedItems(res.data);
  };

  const selectItem = async id => {
    await axios.post(`${API}/select`, { id });
    setAllItems(prev => prev.filter(item => item.id !== id));
    loadSelectedItems();
  };

  const unselectItem = async id => {
    await axios.post(`${API}/unselect`, { id });
    setAllItems([]);
    setOffsetAll(0);
    setHasMoreAll(true);
    loadAllItems(true, searchAll);
    loadSelectedItems();
  };

  const onDragEnd = async result => {
    if (!result.destination) return;
    const items = Array.from(selectedItems);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setSelectedItems(items);
    await axios.post(`${API}/reorder`, { ids: items.map(i => i.id) });
  };

  const handleSearchAll = e => {
    const value = e.target.value;
    setSearchAll(value);
    setOffsetAll(0);
    setHasMoreAll(true);
    setAllItems([]);
    loadAllItems(true, value);
  };

  const handleAddNew = async () => {
    const idNum = parseInt(newId);
    if (!idNum) return alert("Введите корректный ID");
    try {
      const res = await axios.post(`${API}/add`, { id: idNum });
      setAllItems(prev => [...prev, res.data].sort((a, b) => a.id - b.id));
      setNewId("");
    } catch (err) {
      alert(err.response?.data?.message || "Ошибка добавления");
    }
  };

  const filteredSelected = selectedItems.filter(el => el.id.toString().includes(searchSelected));

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      <div style={{ flex: 1, border: "1px solid black", padding: "10px", height: "90vh", overflow: "auto" }}>
        <h3>Все элементы</h3>
        <div style={{ marginBottom: "10px", display: "flex", gap: "5px" }}>
          <input value={newId} onChange={e => setNewId(e.target.value)} placeholder="Новый ID" style={{ flex: 1, padding: "5px" }} />
          <button onClick={handleAddNew} style={{ padding: "5px 10px" }}>Добавить</button>
        </div>
        <input value={searchAll} onChange={handleSearchAll} placeholder="Фильтр по ID" style={{ marginBottom: "10px", width: "100%", padding: "5px" }} />
        {allItems.map(item => (
          <div key={item.id} onClick={() => selectItem(item.id)} style={{ border: "1px solid gray", margin: "5px 0", padding: "5px", borderRadius: "4px", cursor: "pointer" }}>
            ID: {item.id}
          </div>
        ))}
        <div ref={loaderAll} />
      </div>

      <div style={{ flex: 1, border: "1px solid black", padding: "10px", height: "90vh", overflow: "auto" }}>
        <h3>Выбранные элементы</h3>
        <input value={searchSelected} onChange={e => setSearchSelected(e.target.value)} placeholder="Фильтр по ID" style={{ marginBottom: "10px", width: "100%", padding: "5px" }} />
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="selected">
            {provided => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {filteredSelected.map((item, index) => (
                  <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                    {prov => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        style={{ border: "1px solid gray", margin: "5px 0", padding: "5px", borderRadius: "4px", background: "#f0f0f0", cursor: "pointer", ...prov.draggableProps.style }}
                        onClick={() => unselectItem(item.id)}
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
