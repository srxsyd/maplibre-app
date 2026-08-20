const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const db = new DatabaseSync(path.join(__dirname, 'locations.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lng REAL NOT NULL,
    lat REAL NOT NULL
  )
`);

// guest-submitted suggestions for the default location list; admin reviews these separately
db.exec(`
  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lng REAL NOT NULL,
    lat REAL NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

// seeds the original hardcoded Laguna Beach spots on first run only
const SEED = [
  { name: 'Gelato Paradiso', lng: -117.7848033, lat: 33.5413697 },
  { name: 'Laguna Beach Library', lng: -117.7873735, lat: 33.5421318 },
  { name: 'Laguna Art Museum', lng: -117.7907839, lat: 33.5435093 },
  { name: 'Urth Caffe', lng: -117.7884628326063, lat: 33.54429604617076 },
  { name: 'Orange Inn', lng: -117.77958695124651, lat: 33.537763771789876 },
  { name: 'Heisler Park', lng: -117.79010077137939, lat: 33.543539702995915 },
  { name: 'Gorjana Laguna Beach', lng: -117.78316476144846, lat: 33.54433792740509 },
  { name: 'Wild Strawberry Cafe', lng: -117.77432995960018, lat: 33.53168296528258 },
  { name: 'Picnic Stationery Store', lng: -117.78250018843534, lat: 33.54412328038597 },
  { name: 'Treasure Island Beach', lng: -117.75922338136371, lat: 33.51576750352092 },
  { name: 'Sawdust Art Festival', lng: -117.77866035775064, lat: 33.55081305438556 },
];

const { n } = db.prepare('SELECT COUNT(*) AS n FROM locations').get();
if (n === 0) {
  const insert = db.prepare('INSERT INTO locations (name, lng, lat) VALUES (?, ?, ?)');
  for (const loc of SEED) insert.run(loc.name, loc.lng, loc.lat);
}

module.exports = db;
