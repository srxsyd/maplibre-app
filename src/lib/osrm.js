// fetches a street-following route geometry from OSRM's public demo server
// note: the demo server only actually hosts the driving road network — it accepts
// other profile names in the URL but silently serves driving results regardless
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

export async function fetchStreetRoute(coordsList, signal) {
  const coordsParam = coordsList.map(([lng, lat]) => `${lng},${lat}`).join(';');
  const url = `${OSRM_BASE}/${coordsParam}?overview=full&geometries=geojson`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`OSRM request failed: ${res.status}`);

  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes?.[0]) throw new Error('OSRM returned no route');

  return data.routes[0].geometry.coordinates;
}
