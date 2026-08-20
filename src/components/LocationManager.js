import { useState } from 'react';
import PlaceSearch from './PlaceSearch';
import './Panel.css';

const emptyForm = { name: '', lng: '', lat: '' };

function parseCoords(lng, lat) {
  const lngNum = parseFloat(lng);
  const latNum = parseFloat(lat);
  if (Number.isNaN(lngNum) || Number.isNaN(latNum)) return null;
  return { lng: lngNum, lat: latNum };
}

// admin-only: create, edit, and delete the shared default location list
const LocationManager = ({ locations, onCreate, onUpdate, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handlePick = (place) => {
    setForm({ name: place.name, lng: String(place.lng), lat: String(place.lat) });
    setError('');
  };

  const clearPick = () => setForm(emptyForm);

  const handleAdd = async (e) => {
    e.preventDefault();
    const coords = parseCoords(form.lng, form.lat);
    if (!form.name.trim() || !coords) {
      setError('Enter a name and valid longitude/latitude.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onCreate({ name: form.name.trim(), ...coords });
      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
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

  const handleSaveEdit = async (id) => {
    const coords = parseCoords(editForm.lng, editForm.lat);
    if (!editForm.name.trim() || !coords) {
      setError('Enter a name and valid longitude/latitude.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onUpdate(id, { name: editForm.name.trim(), ...coords });
      cancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    setBusy(true);
    setError('');
    try {
      await onDelete(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="App-section">
      <button className="panel-toggle" onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide' : 'Manage'} default locations
      </button>

      {open && (
        <div className="panel-card">
          {error && <p className="panel-error">{error}</p>}

          {form.lng === '' ? (
            <PlaceSearch onPick={handlePick} />
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
                  <label htmlFor="new-name">Name</label>
                  <input
                    id="new-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <button className="panel-submit" type="submit" disabled={busy}>
                  Add spot
                </button>
              </form>
            </>
          )}

          <ul className="panel-list">
            {locations.map((loc) =>
              editingId === loc.id ? (
                <li className="panel-row" key={loc.id}>
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  <input value={editForm.lng} onChange={(e) => setEditForm({ ...editForm, lng: e.target.value })} />
                  <input value={editForm.lat} onChange={(e) => setEditForm({ ...editForm, lat: e.target.value })} />
                  <div className="panel-row-actions">
                    <button className="panel-link" disabled={busy} onClick={() => handleSaveEdit(loc.id)}>
                      Save
                    </button>
                    <button className="panel-link" disabled={busy} onClick={cancelEdit}>
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
                    <button className="panel-link" disabled={busy} onClick={() => startEdit(loc)}>
                      Edit
                    </button>
                    <button className="panel-link danger" disabled={busy} onClick={() => handleDelete(loc.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </section>
  );
};

export default LocationManager;
