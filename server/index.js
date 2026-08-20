const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

// permissive CORS so the API also works if someone runs the client without CRA's dev-server proxy
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// a single shared passcode, not real user auth - enough to keep guests out of admin-only
// routes for a small personal project. Set ADMIN_KEY in the environment to change it.
const ADMIN_KEY = process.env.ADMIN_KEY || 'laguna-admin';

function requireAdmin(req, res, next) {
  if (req.header('x-admin-key') !== ADMIN_KEY) {
    return res.status(401).json({ error: 'admin access required' });
  }
  next();
}

function rowToLocation(row) {
  return { id: row.id, name: row.name, coords: [row.lng, row.lat] };
}

function readLocationBody(req, res) {
  const { name, lng, lat } = req.body;
  if (!name || typeof name !== 'string' || typeof lng !== 'number' || typeof lat !== 'number') {
    res.status(400).json({ error: 'name (string), lng (number), and lat (number) are required' });
    return null;
  }
  return { name, lng, lat };
}

function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

app.post('/api/admin/verify', requireAdmin, (req, res) => {
  res.json({ ok: true });
});

// --- default locations (public read, admin-only write) ---

app.get('/api/locations', (req, res) => {
  const rows = db.prepare('SELECT * FROM locations ORDER BY id').all();
  res.json(rows.map(rowToLocation));
});

app.post('/api/locations', requireAdmin, (req, res) => {
  const body = readLocationBody(req, res);
  if (!body) return;
  const result = db.prepare('INSERT INTO locations (name, lng, lat) VALUES (?, ?, ?)').run(body.name, body.lng, body.lat);
  const row = db.prepare('SELECT * FROM locations WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(rowToLocation(row));
});

app.put('/api/locations/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'location not found' });
  const body = readLocationBody(req, res);
  if (!body) return;
  db.prepare('UPDATE locations SET name = ?, lng = ?, lat = ? WHERE id = ?').run(body.name, body.lng, body.lat, req.params.id);
  const row = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id);
  res.json(rowToLocation(row));
});

app.delete('/api/locations/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'location not found' });
  db.prepare('DELETE FROM locations WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// --- guest recommendations (public submit, admin-only review) ---

app.post('/api/recommendations', (req, res) => {
  const body = readLocationBody(req, res);
  if (!body) return;
  db.prepare('INSERT INTO recommendations (name, lng, lat, created_at) VALUES (?, ?, ?, ?)').run(
    body.name.trim(),
    body.lng,
    body.lat,
    Date.now()
  );
  res.status(201).json({ ok: true });
});

// groups submissions with the same normalized name (trimmed, case-insensitive) into one slot,
// so "Heisler Park" and "heisler park" count as the same recommendation
app.get('/api/recommendations', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM recommendations ORDER BY id').all();
  const groups = new Map();

  for (const row of rows) {
    const key = normalizeName(row.name);
    if (!groups.has(key)) {
      groups.set(key, { key, count: 0, nameCounts: new Map(), lngSum: 0, latSum: 0 });
    }
    const g = groups.get(key);
    g.count += 1;
    g.nameCounts.set(row.name, (g.nameCounts.get(row.name) || 0) + 1);
    g.lngSum += row.lng;
    g.latSum += row.lat;
  }

  const summary = [...groups.values()]
    .map((g) => ({
      key: g.key,
      // the most commonly submitted exact spelling/casing becomes the display name
      name: [...g.nameCounts.entries()].sort((a, b) => b[1] - a[1])[0][0],
      count: g.count,
      coords: [g.lngSum / g.count, g.latSum / g.count],
    }))
    .sort((a, b) => b.count - a.count);

  res.json(summary);
});

// clears every raw submission behind a grouped slot (used after promoting it, or to dismiss it)
app.delete('/api/recommendations/:key', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT id, name FROM recommendations').all();
  const idsToDelete = rows.filter((r) => normalizeName(r.name) === req.params.key).map((r) => r.id);
  if (idsToDelete.length === 0) return res.status(404).json({ error: 'recommendation not found' });
  const del = db.prepare('DELETE FROM recommendations WHERE id = ?');
  for (const id of idsToDelete) del.run(id);
  res.status(204).end();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server listening on http://localhost:${PORT}`));
