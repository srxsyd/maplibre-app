// displays list of locations the user added

const Itinerary = ({ items, onRemove }) => (
  <div>
    <h2 style={{ textAlign: 'center' }}>Itinerary</h2>
    <ol style={{ paddingLeft: 0 }}>
      {items.map((loc) => (
        <li
          key={loc.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            margin: '5px 0',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: loc.color,
            }}
          ></span>
          {loc.name}
          <button
            onClick={() => onRemove(loc.id)}
            style={{
              marginLeft: '10px',
              padding: '2px 6px',
              backgroundColor: 'gray',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Remove
          </button>
        </li>
      ))}
    </ol>
  </div>
);

export default Itinerary;