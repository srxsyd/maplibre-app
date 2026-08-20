import { useCallback, useEffect, useState } from 'react';
import Map from './components/Map';
import LocationList from './components/LocationList';
import Itinerary from './components/Itinerary';
import LocationManager from './components/LocationManager';
import AdminGate from './components/AdminGate';
import RecommendationsPanel from './components/RecommendationsPanel';
import SuggestLocation from './components/SuggestLocation';
import MyLocations from './components/MyLocations';
import { optimalRoute } from './lib/route';
import * as api from './lib/api';
import './App.css';

// curated coastal palette so marker/itinerary colors always look intentional,
// instead of a fully random hex that can land on anything (including near-white or muddy tones)
const PALETTE = ['#c4623f', '#3c6e6a', '#d8a13a', '#7a5c8e', '#3d6ea5', '#a34e30'];

function App() {
  const [locations, setLocations] = useState([]);
  const [locationsError, setLocationsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [myLocations, setMyLocations] = useState([]);
  const [itinerary, setItinerary] = useState([]);

  const [role, setRole] = useState('guest');
  const [adminKey, setAdminKey] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    api
      .getLocations()
      .then(setLocations)
      .catch((err) => setLocationsError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // resumes an admin session from a previous visit in this tab, if the stored passcode still checks out
  useEffect(() => {
    const storedKey = sessionStorage.getItem('adminKey');
    if (!storedKey) return;
    api
      .verifyAdmin(storedKey)
      .then(() => {
        setAdminKey(storedKey);
        if (sessionStorage.getItem('role') === 'admin') setRole('admin');
      })
      .catch(() => {
        sessionStorage.removeItem('adminKey');
        sessionStorage.removeItem('role');
      });
  }, []);

  const handleEnterAdmin = async (passcode) => {
    await api.verifyAdmin(passcode);
    setAdminKey(passcode);
    setRole('admin');
    sessionStorage.setItem('adminKey', passcode);
    sessionStorage.setItem('role', 'admin');
  };

  const handleResumeAdmin = () => {
    setRole('admin');
    sessionStorage.setItem('role', 'admin');
  };

  const handleExitAdmin = () => {
    setRole('guest');
    sessionStorage.setItem('role', 'guest');
  };

  const handleMyLocationsChange = useCallback((items) => setMyLocations(items), []);

  const handleSelect = (loc) => {
    if (!itinerary.find((item) => item.id === loc.id)) {
      const color = PALETTE[itinerary.length % PALETTE.length];
      setItinerary([...itinerary, { ...loc, color }]);
    }
  };

  const handleRemove = (id) => {
    setItinerary(itinerary.filter((loc) => loc.id !== id));
  };

  const handleCreateLocation = async (data) => {
    const created = await api.createLocation(data, adminKey);
    setLocations((prev) => [...prev, created]);
  };

  const handleUpdateLocation = async (id, data) => {
    const updated = await api.updateLocation(id, data, adminKey);
    setLocations((prev) => prev.map((loc) => (loc.id === id ? updated : loc)));
    // keeps a stop already on the trip in sync with its edited name/coords, without losing its assigned color
    setItinerary((prev) => prev.map((loc) => (loc.id === id ? { ...updated, color: loc.color } : loc)));
  };

  const handleDeleteLocation = async (id) => {
    await api.deleteLocation(id, adminKey);
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
    setItinerary((prev) => prev.filter((loc) => loc.id !== id));
  };

  const allLocations = [...locations, ...myLocations];
  const availableLocations = allLocations.filter(
    (loc) => !itinerary.some((item) => item.id === loc.id)
  );

  const route = optimalRoute(itinerary);

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-header-inner">
          <div className="App-header-row">
            <div>
              <p className="App-eyebrow">Day Trip Planner</p>
              <h1 className="App-title">A spontaneous day in Laguna Beach</h1>
              <p className="App-subtitle">
                Pick a few favorites below, drop them on the map, and build the loop you'll
                actually walk.
              </p>
            </div>
            <AdminGate
              role={role}
              isAuthenticated={Boolean(adminKey)}
              onEnterAdmin={handleEnterAdmin}
              onResumeAdmin={handleResumeAdmin}
              onExitAdmin={handleExitAdmin}
            />
          </div>
        </div>
      </header>
      <div className="App-scale-bar" aria-hidden="true" />

      <section className="App-section">
        <p className="App-section-label">Add a stop</p>
        {loading && <p className="App-status">Loading locations…</p>}
        {locationsError && (
          <p className="App-status App-status-error">
            Couldn't reach the API server - make sure it's running (see README).
          </p>
        )}
        {!loading && !locationsError && (
          <LocationList locations={availableLocations} onSelect={handleSelect} />
        )}
      </section>

      <div className="App-main">
        <Map locations={route} onMapReady={setMapInstance} />
        <Itinerary items={route} onRemove={handleRemove} map={mapInstance} />
      </div>

      {role === 'admin' ? (
        <>
          <RecommendationsPanel adminKey={adminKey} onPromote={handleCreateLocation} />
          <LocationManager
            locations={locations}
            onCreate={handleCreateLocation}
            onUpdate={handleUpdateLocation}
            onDelete={handleDeleteLocation}
          />
        </>
      ) : (
        <>
          <SuggestLocation onSubmit={api.submitRecommendation} />
          <MyLocations onChange={handleMyLocationsChange} />
        </>
      )}
    </div>
  );
}

export default App;
