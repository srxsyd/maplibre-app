import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import jQuery from 'jquery';
import { fetchStreetRoute } from '../lib/osrm';
import './Map.css';

const ROUTE_SOURCE_ID = 'route';
const ROUTE_LAYER_ID = 'route-line';
const EMPTY_ROUTE = { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } };
const DASH_ESTIMATE = [0.2, 1.6]; // shown while the real street route is still loading (or failed)
const DASH_SOLID = [1, 0]; // shown once OSRM returns a real street-following route

// maintains the map
const Map = ({ locations, onMapReady }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null); // stores the maplibre map reference
  const markersRef = useRef([]); // stores markers
  const routeAbortRef = useRef(null); // cancels an in-flight street-route request when stops change again
  const [mapLoaded, setMapLoaded] = useState(false);

  function setMarkerColor(marker, color) {
    const $elem = jQuery(marker.getElement());
    $elem.css('background-color', color);
    marker._color = color;
  }

  useEffect(() => {
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [-117.7828, 33.5427],
      zoom: 13,
      // keeps the rendered frame available after paint so map.getCanvas().toDataURL() (used for
      // exporting the trip as an image) doesn't return a blank canvas
      preserveDrawingBuffer: true,
    });
    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapRef.current.on('load', () => {
      setMapLoaded(true);
      onMapReady?.(mapRef.current);
    });

    return () => mapRef.current.remove();
    // runs once on mount only — the map must not be recreated if onMapReady's identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // updates the markers so there are no duplicates
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // creates marker for location; initially set to transparent, but later updated
    locations.forEach((loc) => {
      const el = document.createElement('div');
      el.className = 'map-marker';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(loc.coords)
        .addTo(mapRef.current);

      // marker color updated
      setMarkerColor(marker, loc.color);

      // saves new marker in markersRef
      markersRef.current.push(marker);
    });

    // making sure the map displays all markers
    if (locations.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      locations.forEach(loc => bounds.extend(loc.coords));
      mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 15 });
    }

    // cancel any street-route request from a previous set of stops
    routeAbortRef.current?.abort();

    // draws a straight-line estimate immediately; upgraded to a real street route below if OSRM responds
    const straightLine = {
      ...EMPTY_ROUTE,
      geometry: { type: 'LineString', coordinates: locations.length > 1 ? locations.map(loc => loc.coords) : [] },
    };
    if (mapRef.current.getSource(ROUTE_SOURCE_ID)) {
      mapRef.current.getSource(ROUTE_SOURCE_ID).setData(straightLine);
      mapRef.current.setPaintProperty(ROUTE_LAYER_ID, 'line-dasharray', DASH_ESTIMATE);
    } else {
      mapRef.current.addSource(ROUTE_SOURCE_ID, { type: 'geojson', data: straightLine });
      mapRef.current.addLayer({
        id: ROUTE_LAYER_ID,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#2b2622',
          'line-width': 2.5,
          'line-dasharray': DASH_ESTIMATE,
          'line-opacity': 0.75,
        },
      });
    }

    // fetches the street-following geometry for the same stop order and swaps it in when it arrives
    if (locations.length > 1) {
      const controller = new AbortController();
      routeAbortRef.current = controller;

      fetchStreetRoute(locations.map(loc => loc.coords), controller.signal)
        .then((coords) => {
          if (controller.signal.aborted || !mapRef.current.getSource(ROUTE_SOURCE_ID)) return;
          mapRef.current.getSource(ROUTE_SOURCE_ID).setData({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: coords },
          });
          mapRef.current.setPaintProperty(ROUTE_LAYER_ID, 'line-dasharray', DASH_SOLID);
        })
        .catch(() => {
          // network hiccup or the demo server is unavailable — the straight-line estimate stays visible
        });
    }
  }, [locations, mapLoaded]);

  return (
    <div className="map-card">
      <div ref={mapContainer} className="map-canvas" />
    </div>
  );
};

export default Map;
