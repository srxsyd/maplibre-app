import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const Map = ({ locations }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-74.5, 40],
      zoom: 2,
    });

    return () => mapRef.current.remove();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    mapRef.current.eachLayer && mapRef.current.eachLayer((layer) => {
      if (layer.remove) layer.remove();
    });

    // Add markers for each location
    locations.forEach((loc) => {
      const el = document.createElement('div');
      el.style.backgroundColor = loc.color;
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';

      new maplibregl.Marker(el)
        .setLngLat(loc.coords)
        .addTo(mapRef.current);
    });

    // Optional: fit bounds to show all markers
    if (locations.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      locations.forEach((loc) => bounds.extend(loc.coords));
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }
  }, [locations]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      <div
        ref={mapContainer}
        style={{ width: '75%', height: '400px', border: '1px solid #ccc', borderRadius: '8px' }}
      />
    </div>
  );
};

export default Map;
