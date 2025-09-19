import { useState } from 'react';
import Map from './Map';
import LocationList from './LocationList';
import Itinerary from './Itinerary';
import locations from './data/locations';

function App() {
  const [itinerary, setItinerary] = useState([]);

  /* adding the location to the itinerary list. getting the location, generating random color, and adding to the list */
  const addToItinerary = (location) => {
    if (!itinerary.find((item) => item.id === location.id)) {
      const locationWithColor = { ...location, color: getRandomColor() };
      setItinerary([...itinerary, locationWithColor]);
    }
  };

  const handleSelect = (loc) => {
    /* making sure to assign a random color if the location is new only */
    if (!itinerary.find((item) => item.id === loc.id)) {
      const locWithColor = { ...loc, color: getRandomColor() };
      setItinerary([...itinerary, locWithColor]);
    }
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

// random color generation function

function getRandomColor() {
  const letters = '0123456789ABCDEF'; // hex code
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export default App;
