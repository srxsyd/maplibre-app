import { jsPDF } from 'jspdf';

// composites the rendered map canvas with a drawn itinerary list into one image,
// then either downloads it directly (png/jpeg) or wraps it in a one-page pdf
export async function exportTrip(map, route, format) {
  if (!map || route.length === 0) return;

  await document.fonts.ready;

  const mapCanvas = map.getCanvas();
  const mapWidth = mapCanvas.width;
  const mapHeight = mapCanvas.height;

  const rowHeight = 34;
  const headerHeight = 56;
  const padding = 28;
  const listHeight = headerHeight + route.length * rowHeight + padding;

  const canvas = document.createElement('canvas');
  canvas.width = mapWidth;
  canvas.height = mapHeight + listHeight;
  const ctx = canvas.getContext('2d');

  // background
  ctx.fillStyle = '#f6f1e9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // MapLibre clears its WebGL drawing buffer between paints, so the map has to be copied out
  // synchronously inside a fresh 'render' event — capturing at any other time reads blank pixels
  await new Promise((resolve) => {
    map.once('render', () => {
      ctx.drawImage(map.getCanvas(), 0, 0);
      resolve();
    });
    map.triggerRepaint();
  });

  // the stop markers are DOM/CSS elements MapLibre overlays on the map, not part of the WebGL
  // canvas itself, so they have to be redrawn by hand at their projected pixel position
  const dpr = mapWidth / mapCanvas.clientWidth;
  route.forEach((loc) => {
    const point = map.project(loc.coords);
    const x = point.x * dpr;
    const y = point.y * dpr;

    ctx.fillStyle = loc.color;
    ctx.beginPath();
    ctx.arc(x, y, 9 * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3 * dpr;
    ctx.strokeStyle = '#fffdf9';
    ctx.stroke();
    ctx.lineWidth = 1 * dpr;
    ctx.strokeStyle = '#2b2622';
    ctx.stroke();
  });

  // divider between map and list
  ctx.strokeStyle = '#2b2622';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, mapHeight);
  ctx.lineTo(canvas.width, mapHeight);
  ctx.stroke();

  // title
  ctx.fillStyle = '#2b2622';
  ctx.font = '700 24px "Playfair Display", Georgia, serif';
  ctx.fillText('Laguna Beach Itinerary', padding, mapHeight + 38);

  // stop rows: colored dot + numbered name
  route.forEach((loc, i) => {
    const y = mapHeight + headerHeight + i * rowHeight;

    ctx.fillStyle = loc.color;
    ctx.beginPath();
    ctx.arc(padding + 7, y - 5, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2b2622';
    ctx.font = '15px "Work Sans", Arial, sans-serif';
    ctx.fillText(`${i + 1}.  ${loc.name}`, padding + 24, y);
  });

  if (format === 'pdf') {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('laguna-beach-itinerary.pdf');
    return;
  }

  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const ext = format === 'jpeg' ? 'jpg' : 'png';
  const dataUrl = canvas.toDataURL(mime, 0.92);

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `laguna-beach-itinerary.${ext}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
