import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import jQuery from 'jquery';

// maintains the map
const Map = ({ locations }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  function setMarkerColor(marker, color) {
    const $elem = jQuery(marker.getElement());
    $elem.css('background-color', color);
    marker._color = color;
  }

  useEffect(() => {
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json', // the style of the map
      center: [-74.5, 40],
      zoom: 2,
    });

    return () => mapRef.current.remove();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    locations.forEach((loc) => {
      const el = document.createElement('div');
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.backgroundColor = 'transparent';

      const marker = new maplibregl.Marker(el)
        .setLngLat(loc.coords)
        .addTo(mapRef.current);

      setMarkerColor(marker, loc.color);

      markersRef.current.push(marker);
    });

    if (locations.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      locations.forEach(loc => bounds.extend(loc.coords));
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
