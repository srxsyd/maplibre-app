const Itinerary = ({ items }) => (
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
        </li>
      ))}
    </ol>
  </div>
);

export default Itinerary;
