import ExportTrip from './ExportTrip';
import './Itinerary.css';

// displays list of locations the user added
// items: array of selected locations
// onRemove: function to remove a location
// map: the maplibre map instance, used to export a snapshot alongside this list

const Itinerary = ({ items, onRemove, map }) => (
  <div className="itinerary-card">
    <div className="itinerary-header">
      <h2 className="itinerary-title">Your itinerary</h2>
      <ExportTrip map={map} route={items} />
    </div>
    {items.length === 0 ? (
      <p className="itinerary-empty">Nothing added yet. Tap a place above to start building your route.</p>
    ) : (
      <ol className="itinerary-list">
        {items.map((loc, i) => (
          <li key={loc.id} className="itinerary-row">
            <span className="itinerary-index">{i + 1}</span>
            <span className="itinerary-dot" style={{ backgroundColor: loc.color }} />
            <span className="itinerary-name">{loc.name}</span>
            <button className="itinerary-remove" onClick={() => onRemove(loc.id)}>
              Remove
            </button>
          </li>
        ))}
      </ol>
    )}
  </div>
);

export default Itinerary;
