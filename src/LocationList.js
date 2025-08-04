const LocationList = ({ locations, onSelect }) => (
  <div>
    <h2>Popular Locations</h2>
    {locations.map((loc) => (
      <button key={loc.id} onClick={() => onSelect(loc)}>
        {loc.name}
      </button>
    ))}
  </div>
);

export default LocationList;
