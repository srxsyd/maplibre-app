const Itinerary = ({ items }) => (
  <div>
    <h2>Itinerary</h2>
    <ol className="itinerary-list-edit">
      {items.map((loc) => (
        <li key={loc.id}>{loc.name}</li>
      ))}
    </ol>
  </div>
);

export default Itinerary;