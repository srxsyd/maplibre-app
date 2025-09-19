import { useState } from 'react';
import Map from './Map';
import LocationList from './LocationList';
import Itinerary from './Itinerary';
import locations from './data/locations';

function App() {
  const [itinerary, setItinerary] = useState([]);

  const addToItinerary = (location) => {
    if (!itinerary.find((item) => item.id === location.id)) {
      const locationWithColor = { ...location, color: getRandomColor() };
      setItinerary([...itinerary, locationWithColor]);
    }
  };

  const handleSelect = (loc) => {
    const locWithColor = { ...loc, color: getRandomColor() };
    addToItinerary(locWithColor);
  };

  return (
    <div className="App">
      <h1>Trip Planner</h1>
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
