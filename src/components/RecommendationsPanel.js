import { useCallback, useEffect, useState } from 'react';
import * as api from '../lib/api';
import './Panel.css';

// admin-only: reviews guest-submitted suggestions, grouped by normalized name so
// repeat/near-duplicate submissions count toward one slot instead of scattering
const RecommendationsPanel = ({ adminKey, onPromote }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyKey, setBusyKey] = useState(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .getRecommendations(adminKey)
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [adminKey]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const handlePromote = async (item) => {
    setBusyKey(item.key);
    setError('');
    try {
      await onPromote({ name: item.name, lng: item.coords[0], lat: item.coords[1] });
      await api.dismissRecommendation(item.key, adminKey);
      setItems((prev) => prev.filter((i) => i.key !== item.key));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyKey(null);
    }
  };

  const handleDismiss = async (item) => {
    setBusyKey(item.key);
    setError('');
    try {
      await api.dismissRecommendation(item.key, adminKey);
      setItems((prev) => prev.filter((i) => i.key !== item.key));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <section className="App-section">
      <button className="panel-toggle" onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide' : 'Show'} guest recommendations
      </button>

      {open && (
        <div className="panel-card">
          {error && <p className="panel-error">{error}</p>}
          {loading && <p className="panel-hint">Loading recommendations…</p>}
          {!loading && items.length === 0 && !error && <p className="panel-empty">No guest recommendations yet.</p>}
          {!loading && items.length > 0 && (
            <ul className="panel-list">
              {items.map((item) => (
                <li className="panel-row" key={item.key}>
                  <span className="panel-row-name">{item.name}</span>
                  <span className="panel-badge">{item.count}×</span>
                  <span className="panel-row-coord">
                    {item.coords[0].toFixed(4)}, {item.coords[1].toFixed(4)}
                  </span>
                  <div className="panel-row-actions">
                    <button className="panel-link" disabled={busyKey === item.key} onClick={() => handlePromote(item)}>
                      Add to defaults
                    </button>
                    <button
                      className="panel-link danger"
                      disabled={busyKey === item.key}
                      onClick={() => handleDismiss(item)}
                    >
                      Dismiss
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};

export default RecommendationsPanel;
