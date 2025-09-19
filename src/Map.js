import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const Map = ({ selectedLocation }) => {
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
    if (selectedLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: selectedLocation.coords,
        zoom: 15,
        essential: true,
      });

      const colorAdd = document.createElement('div');
      colorAdd.style.backgroundColor = selectedLocation.color;

      new maplibregl.Marker(colorAdd)
        .setLngLat(selectedLocation.coords)
        .addTo(mapRef.current);
    }
  }, [selectedLocation]);

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
