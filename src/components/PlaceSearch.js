import { useState } from 'react';
import './PlaceSearch.css';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
// soft bias toward Laguna Beach - nudges results without excluding matches elsewhere
const LAGUNA_VIEWBOX = '-117.83,33.58,-117.73,33.50';

async function search(query) {
  const url = `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(query)}&limit=5&viewbox=${LAGUNA_VIEWBOX}&bounded=0`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Search failed - try again.');
  return res.json();
}

// looks up a place name via OpenStreetMap's free Nominatim geocoder and hands back
// { name, lng, lat } once the caller picks a result - no API key needed, but keep
// searches to explicit user action (not per-keystroke) to respect its rate limit
const PlaceSearch = ({ onPick, placeholder = 'Search for a place…' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const runSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setError('');
    setResults([]);
    try {
      const data = await search(query.trim());
      setResults(data);
      if (data.length === 0) setError('No matches found.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handlePick = (place) => {
    onPick({
      name: place.display_name.split(',')[0],
      lng: parseFloat(place.lon),
      lat: parseFloat(place.lat),
    });
    setQuery('');
    setResults([]);
    setError('');
  };

  return (
    <div className="place-search">
      <form className="place-search-row" onSubmit={runSearch}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} />
        <button type="submit" disabled={busy}>
          {busy ? 'Searching…' : 'Search'}
        </button>
      </form>
      {error && <p className="place-search-error">{error}</p>}
      {results.length > 0 && (
        <ul className="place-search-results">
          {results.map((r) => (
            <li key={r.place_id}>
              <button type="button" onClick={() => handlePick(r)}>
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlaceSearch;
