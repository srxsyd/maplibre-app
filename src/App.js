import { useState } from 'react';
import Map from './Map';
import LocationList from './LocationList';
import Itinerary from './Itinerary';
import locations from './data/locations';

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [itinerary, setItinerary] = useState([]);

  const addToItinerary = (location) => {
    if (!itinerary.find((item) => item.id === location.id)) {
      setItinerary([...itinerary, location]);
    }
  };

  return (
    <div className="App">
      <h1>Trip Planner</h1>
      <LocationList
        locations={locations}
        onSelect={(loc) => {
          setSelectedLocation(loc);
          addToItinerary(loc);
        }}
      />
      <Map selectedLocation={selectedLocation} />
      <Itinerary items={itinerary} />
    </div>
  );
}

export default App;
