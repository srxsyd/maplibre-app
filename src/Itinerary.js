const Itinerary = ({ items }) => (
  <div>
    <h2>Itinerary</h2>
    <ul>
      {items.map((loc) => (
        <li key={loc.id}>{loc.name}</li>
      ))}
    </ul>
  </div>
);

export default Itinerary;
