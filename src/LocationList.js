import React from 'react';
import './App.css';

const LocationList = ({ locations, onSelect }) => (
  <div>
    <h2 style={{ textAlign: 'center' }}>Popular Laguna Beach Day Trip Activities</h2>
    <div className="location-list">
      {locations.map((loc) => (
        <button
          key={loc.id}
          onClick={() => onSelect(loc)}
          className="location-button"
        >
          {loc.name}
        </button>
      ))}
    </div>
  </div>
);

export default LocationList;
