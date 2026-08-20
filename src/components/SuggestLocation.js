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

// guests can't edit the shared default list directly, so this queues a suggestion for admin review
const SuggestLocation = ({ onSubmit }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);

  const handlePick = (place) => {
    setForm({ name: place.name, lng: String(place.lng), lat: String(place.lat) });
    setError('');
    setConfirmation('');
  };

  const clearPick = () => setForm(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const coords = parseCoords(form.lng, form.lat);
    if (!form.name.trim() || !coords) {
      setError('Enter a name and valid longitude/latitude.');
      return;
    }
    setBusy(true);
    setError('');
    setConfirmation('');
    try {
      await onSubmit({ name: form.name.trim(), ...coords });
      setForm(emptyForm);
      setConfirmation('Thanks! Your suggestion is in the review queue.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="App-section">
      <button className="panel-toggle" onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide suggestion form' : 'Suggest a spot for everyone'}
      </button>

      {open && (
        <div className="panel-card">
          <p className="panel-hint">
            Know a great spot that's missing? Suggest it and it'll show up for the admin to add to the shared list.
          </p>
          {error && <p className="panel-error">{error}</p>}
          {confirmation && <p className="panel-hint">{confirmation}</p>}

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
              <form className="panel-form" onSubmit={handleSubmit}>
                <div className="panel-field panel-field-wide">
                  <label htmlFor="rec-name">Name</label>
                  <input
                    id="rec-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <button className="panel-submit" type="submit" disabled={busy}>
                  Suggest
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default SuggestLocation;
