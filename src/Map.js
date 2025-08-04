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
        zoom: 10,
        essential: true,
      });

      new maplibregl.Marker()
        .setLngLat(selectedLocation.coords)
        .addTo(mapRef.current);
    }
  }, [selectedLocation]);

  return <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />;
};

export default Map;
