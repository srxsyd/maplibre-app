import { useState } from 'react';
import Map from './Map';
import LocationList from './LocationList';
import Itinerary from './Itinerary';
import locations from './data/locations';

function App() {
  const [itinerary, setItinerary] = useState([]);

  const handleSelect = (loc) => {
    if (!itinerary.find((item) => item.id === loc.id)) {
      const locWithColor = { ...loc, color: getRandomColor() };
      setItinerary([...itinerary, locWithColor]);
    }
  };

  return (
    <div className="App">
      <h1 style={{ textAlign: 'center' }}>Trip Planner</h1>
      <LocationList locations={locations} onSelect={handleSelect} />
      <Map locations={itinerary} />
      <Itinerary items={itinerary} />
    </div>
  );
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export default App;
