// finds a short walking order for a set of stops (open-path traveling salesman)

// great-circle distance in meters between two [lng, lat] points
function distance(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function tourLength(order, points) {
  let total = 0;
  for (let i = 0; i < order.length - 1; i++) {
    total += distance(points[order[i]], points[order[i + 1]]);
  }
  return total;
}

function nearestNeighborTour(points, start) {
  const n = points.length;
  const visited = new Array(n).fill(false);
  const order = [start];
  visited[start] = true;
  for (let step = 1; step < n; step++) {
    const last = order[order.length - 1];
    let best = -1;
    let bestDist = Infinity;
    for (let j = 0; j < n; j++) {
      if (!visited[j]) {
        const d = distance(points[last], points[j]);
        if (d < bestDist) {
          bestDist = d;
          best = j;
        }
      }
    }
    order.push(best);
    visited[best] = true;
  }
  return order;
}

// standard 2-opt local search: repeatedly reverses a segment if doing so shortens the tour
function twoOpt(order, points) {
  let best = order;
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < best.length - 1; i++) {
      for (let k = i + 1; k < best.length; k++) {
        const candidate = [...best.slice(0, i), ...best.slice(i, k + 1).reverse(), ...best.slice(k + 1)];
        if (tourLength(candidate, points) < tourLength(best, points)) {
          best = candidate;
          improved = true;
        }
      }
    }
  }
  return best;
}

// reorders items into a short (not guaranteed shortest-possible, but very close for this few stops)
// walking path: tries every stop as the starting point, refines each with 2-opt, keeps the best
export function optimalRoute(items) {
  if (items.length < 3) return items;

  const points = items.map((item) => item.coords);
  let bestOrder = null;
  let bestLength = Infinity;

  for (let start = 0; start < points.length; start++) {
    const order = twoOpt(nearestNeighborTour(points, start), points);
    const length = tourLength(order, points);
    if (length < bestLength) {
      bestLength = length;
      bestOrder = order;
    }
  }

  return bestOrder.map((i) => items[i]);
}
