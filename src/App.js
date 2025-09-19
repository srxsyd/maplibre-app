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
      <h1 style={{ textAlign: 'center' }}>Laguna Beach Trip Planner</h1>
      <LocationList locations={locations} onSelect={handleSelect} />
      <Map locations={itinerary} />
      <Itinerary items={itinerary} />
    </div>
  );
}

function getRandomColor() {
  const hue = 180 + Math.floor(Math.random() * 60); 
  const saturation = 50 + Math.floor(Math.random() * 40); 
  const lightness = 40 + Math.floor(Math.random() * 30); 
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}




export default App;
