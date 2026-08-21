# maplibre-app

# day trip: laguna beach

recently, i went on a day trip with some friends to laguna beach and i remembered stressing out the few nights before planning what i wanted to do there. taking inspiration from that experience, i thought it would be fun to create a map-based application that has a list of recommended places to visit and itinerary list a user can add to.

# screenshots

**guest view:** choose locations from the default pins suggested, get your own day-trip route!

![guest view: build your own itinerary](screenshots/guest-view-map.png)

**guest view:** is your favorite location not listed? suggest a pin (sent to admin for review) or use the personal-pin feature to add your own private pin

![guest view: suggestion form and personal pins](screenshots/guest-view-suggest-and-personal.png)

**admin view:** the admin can review guest recommendations and choose to add them to the default pin list. they can also remove default pins if locations have been reported to be closed.

![admin view: guest recommendation and default pin management](screenshots/admin-view.png)

**exported itinerary:** done using the app? export your itinerary as a png, jpeg, or pdf!

![an itinerary exported from the app](screenshots/exported-itinerary.png)

# tech stack

- **frontend**: react (create react app), plain css
- **map**: maplibre gl js, styled with openfreemap's free vector tiles
- **routing**: osrm's public demo server, for a real street-following route between stops
- **geocoding**: openstreetmap's nominatim, so places can be added by name instead of typing coordinates
- **backend**: express, with sqlite (node's built-in `node:sqlite`) for storage
- **deployment**: the react app on vercel, the api on render

# running locally

the location data lives in a small sqlite-backed api server instead of a hardcoded file, so two things need to run at once:

```
# terminal 1: api server (first time only, run: cd server && npm install)
cd server && npm start

# terminal 2: react app
npm start
```

the react dev server proxies `/api/*` requests to the api server on port 4000.

# admin access

admin view is gated by a passcode, checked server-side. it isn't a real user account, but is enough to keep guests from adding, editing, or deleting the default locations. the vercel deployment has it set to a password private to me (for now).

# deploying

**live demo:** [daytrip-planner.vercel.app](https://daytrip-planner.vercel.app/)

vercel hosts the react frontend; render hosts the api (`render.yaml` at the repo root configures it as a Blueprint). the frontend finds the api via a `REACT_APP_API_BASE` environment variable set on vercel, pointing at the render url plus `/api`. locally that variable is left unset and falls back to the relative `/api` path, which cra's dev-server proxy forwards to `http://localhost:4000`.

note: render's free plan doesn't persist disk across redeploys, so the sqlite file (and anything added through the app) resets to the seed locations whenever the api is redeployed.