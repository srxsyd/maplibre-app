import './LocationList.css';

const LocationList = ({ locations, onSelect }) => (
  <div className="location-list-container">
    <div className="location-list-slider">
      {locations.map((loc) => (
        <button
          key={loc.id}
          className="location-button"
          onClick={() => onSelect(loc)}
        >
          {loc.name}
        </button>
      ))}
      {locations.map((loc) => (
        <button
          key={loc.id + '-duplicate'}
          className="location-button"
          onClick={() => onSelect(loc)}
        >
          {loc.name}
        </button>
      ))}
    </div>
  </div>
);

export default LocationList;
