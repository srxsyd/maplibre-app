import { useEffect, useState } from 'react';
import PlaceSearch from './PlaceSearch';
import './Panel.css';

const STORAGE_KEY = 'myLocations';
const emptyForm = { name: '', lng: '', lat: '' };

function parseCoords(lng, lat) {
  const lngNum = parseFloat(lng);
  const latNum = parseFloat(lat);
  if (Number.isNaN(lngNum) || Number.isNaN(latNum)) return null;
  return { lng: lngNum, lat: latNum };
}

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// personal locations kept only in this browser (never sent to the server) — separate from
// both the shared default list and from suggesting a spot for everyone to review
const MyLocations = ({ onChange }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(loadStored);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    onChange(items);
  }, [items, onChange]);

  const handlePick = (place) => {
    setForm({ name: place.name, lng: String(place.lng), lat: String(place.lat) });
    setError('');
  };

  const clearPick = () => setForm(emptyForm);

  const handleAdd = (e) => {
    e.preventDefault();
    const coords = parseCoords(form.lng, form.lat);
    if (!form.name.trim() || !coords) {
      setError('Enter a name and valid longitude/latitude.');
      return;
    }
    setError('');
    setItems((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: form.name.trim(),
        coords: [coords.lng, coords.lat],
      },
    ]);
    setForm(emptyForm);
  };

  const startEdit = (loc) => {
    setEditingId(loc.id);
    setEditForm({ name: loc.name, lng: String(loc.coords[0]), lat: String(loc.coords[1]) });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const handleSaveEdit = (id) => {
    const coords = parseCoords(editForm.lng, editForm.lat);
    if (!editForm.name.trim() || !coords) {
      setError('Enter a name and valid longitude/latitude.');
      return;
    }
    setError('');
    setItems((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, name: editForm.name.trim(), coords: [coords.lng, coords.lat] } : loc))
    );
    cancelEdit();
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((loc) => loc.id !== id));
  };

  return (
    <section className="App-section">
      <button className="panel-toggle" onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide' : 'Manage'} my locations
      </button>

      {open && (
        <div className="panel-card">
          <p className="panel-hint">
            Add your own spots for this trip — these stay in your browser only, not shared with anyone else.
          </p>
          {error && <p className="panel-error">{error}</p>}

          {form.lng === '' ? (
            <PlaceSearch onPick={handlePick} placeholder="Search for your spot…" />
          ) : (
            <>
              <p className="place-search-picked">
                Picked: <strong>{form.name}</strong>{' '}
                <span className="mono-num">
                  ({parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)})
                </span>
                <button type="button" onClick={clearPick}>
                  Search again
                </button>
              </p>
              <form className="panel-form" onSubmit={handleAdd}>
                <div className="panel-field panel-field-wide">
                  <label htmlFor="mine-name">Name</label>
                  <input
                    id="mine-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <button className="panel-submit" type="submit">
                  Add spot
                </button>
              </form>
            </>
          )}

          {items.length === 0 ? (
            <p className="panel-empty">You haven't added any personal spots yet.</p>
          ) : (
            <ul className="panel-list">
              {items.map((loc) =>
                editingId === loc.id ? (
                  <li className="panel-row" key={loc.id}>
                    <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    <input value={editForm.lng} onChange={(e) => setEditForm({ ...editForm, lng: e.target.value })} />
                    <input value={editForm.lat} onChange={(e) => setEditForm({ ...editForm, lat: e.target.value })} />
                    <div className="panel-row-actions">
                      <button className="panel-link" onClick={() => handleSaveEdit(loc.id)}>
                        Save
                      </button>
                      <button className="panel-link" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </li>
                ) : (
                  <li className="panel-row" key={loc.id}>
                    <span className="panel-row-name">{loc.name}</span>
                    <span className="panel-row-coord">{loc.coords[0].toFixed(4)}</span>
                    <span className="panel-row-coord">{loc.coords[1].toFixed(4)}</span>
                    <div className="panel-row-actions">
                      <button className="panel-link" onClick={() => startEdit(loc)}>
                        Edit
                      </button>
                      <button className="panel-link danger" onClick={() => handleDelete(loc.id)}>
                        Delete
                      </button>
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};

export default MyLocations;
